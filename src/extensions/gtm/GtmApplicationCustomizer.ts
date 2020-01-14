import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import { BaseApplicationCustomizer } from '@microsoft/sp-application-base';

import * as strings from 'GtmApplicationCustomizerStrings';

const LOG_SOURCE: string = 'GtmApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IGtmApplicationCustomizerProperties {
  trackingID: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class GtmApplicationCustomizer extends BaseApplicationCustomizer<IGtmApplicationCustomizerProperties> {

  /**
   * Ensuring the script is load only once
   * @property
   * @private
   */
  private isInitialLoad: boolean = true;

  /**
   * Default function loaded by the extension
   * @private
   */
  private navigatedEvent(): void {
    let trackingID: string = this.properties.trackingID;
    if (!trackingID) {
      Log.info(LOG_SOURCE, `${strings.MissingID}`);
    } else {
      Log.info(LOG_SOURCE, `Tracking Site ID: ${trackingID}`);

      if (this.isInitialLoad) {
        Log.info(LOG_SOURCE, `Initial load`);
        this.realInitialNavigatedEvent(trackingID);
        this.isInitialLoad = false;
      }
    }
  }

  /**
   * Google Tag Manager injection script and custom JavaScript function `refreshGTMDatalayer` for partial or custom load event
   * @param trackingID Google Tag Manager unique ID
   * @private
   */
  private realInitialNavigatedEvent(trackingID: string): void {
    Log.info(LOG_SOURCE, `Tracking full page load...`);

    var gtagScript = document.createElement("script");
    gtagScript.type = "text/javascript";
    gtagScript.id = "sp-gtm-script";
    gtagScript.async = true;
    gtagScript.innerHTML = `
      <!-- Google Tag Manager -->
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${trackingID}');
      <!-- End Google Tag Manager -->

      function refreshGTMDatalayer(dl) {
        Log.info(LOG_SOURCE,'Info: refreshGTMDatalayer');
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(dl);
      }
    `;
    document.head.appendChild(gtagScript);

    var gtagBody = document.createElement("noscript");
    gtagBody.id = "sp-gtm-body";
    gtagBody.innerHTML = `
      <!-- Google Tag Manager (noscript) -->
      <iframe src="https://www.googletagmanager.com/ns.html?id=${trackingID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>
      <!-- End Google Tag Manager (noscript) -->`;
    document.body.appendChild(gtagBody);
  }

  @override
  public onInit(): Promise<void> {

    Log.info(LOG_SOURCE, `Initialized Google Analytics`);

    /* This event is triggered when user navigate between the pages */
    this.context.application.navigatedEvent.add(this, this.navigatedEvent);

    return Promise.resolve();
  }
}