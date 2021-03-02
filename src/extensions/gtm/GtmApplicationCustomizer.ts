import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer
} from '@microsoft/sp-application-base';
import { Dialog } from '@microsoft/sp-dialog';
import { IUserItem } from "./IUserItem";
import * as strings from 'GtmApplicationCustomizerStrings';

const LOG_SOURCE: string = 'AnalyticsApplicationCustomizer';

var currentURL: string = document.location.href;
var previousURL: string = "";

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IGoogleAnalyticsApplicationCustomizerProperties {
  trackingID: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class GoogleAnalyticsApplicationCustomizer
  extends BaseApplicationCustomizer<IGoogleAnalyticsApplicationCustomizerProperties> {

  private currentPage = "";
  private isInitialLoad = true;

  private getFreshCurrentPage(): string {
    return window.location.pathname + window.location.search;
  }

  private updateCurrentPage(): void {
    this.currentPage = this.getFreshCurrentPage();
  }
  private async GetUserInfo():Promise<IUserItem> {
    var userInfo = "";
    let client = await this.context.msGraphClientFactory.getClient();
    let response = await client.api('/me').get();
    return response as  IUserItem;
  }
  
  private navigatedEvent(): void {

    let trackingID: string = this.properties.trackingID;
    if (!trackingID) {
      Log.info(LOG_SOURCE, `${strings.MissingID}`);
    } else {

      const navigatedPage = this.getFreshCurrentPage();

      if (this.isInitialLoad) {
        this.realInitialNavigatedEvent(trackingID);
        this.updateCurrentPage();
        this.isInitialLoad = false;

      }
      else if (!this.isInitialLoad && (navigatedPage !== this.currentPage)) {
        this.realNavigatedEvent(trackingID);
        this.updateCurrentPage();
      }
    }
  }

  private async realInitialNavigatedEvent(trackingID: string) {
    console.log("Adding GTM full page load...");

    var gtmScript = document.createElement("script");
    gtmScript.type = "text/javascript";
    gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${trackingID}`;
    gtmScript.async = true;
    document.head.appendChild(gtmScript);

   var  userInfo:IUserItem = await this.GetUserInfo();
   console.log("userPrincipalName  = " + userInfo.userPrincipalName);    
   var nameId = userInfo.userPrincipalName.replace('corpstg1.jmfamily.com', 'JM');

   let dealerCode = '';
   let dealer = '';
   //let dealerInfo = document.getElementById('menu-context').children[0].children[0].children[0].innerHTML.trim();
   let dealerInfo = "SET No:01007 | BILL PENNEY TOYOTA";
   if(dealerInfo !== "")
    {
      dealerCode = dealerInfo.split('|')[0].trim().split(':')[1].trim();
      //dealer = dealerInfo.split('|')[1].trim();

      eval(`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config',  '${trackingID}');
          gtag('userId', '${nameId}');
          gtag('set_dealer_number', '${dealerCode}');
          gtag('app_name', 'SharePointOnline');
        `);
    }
    else
    {      
      eval(`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config',  '${trackingID}');
      gtag('userId', '${nameId}');
    `);
    }
  }

  private async realNavigatedEvent(trackingID: string) {

    console.log("Tracking partial page load...");

    var  userInfo:IUserItem = await this.GetUserInfo();
    console.log("userPrincipalName  = " + userInfo.userPrincipalName);    
    var nameId = userInfo.userPrincipalName.replace('corpstg1.jmfamily.com', 'JM');

    let dealerCode = '';
    let dealer = '';
    //let dealerInfo = document.getElementById('menu-context').children[0].children[0].children[0].innerHTML.trim();
    let dealerInfo = "SET No:01007 | BILL PENNEY TOYOTA";

    if(dealerInfo !== "")
    {
      dealerCode = dealerInfo.split('|')[0].trim().split(':')[1].trim();
      //dealer = dealerInfo.split('|')[1].trim();

      eval(`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config',  '${trackingID}');
          gtag('userId', '${nameId}');
          gtag('set_dealer_number', '${dealerCode}');
          gtag('app_name', 'SharePointOnline');
        `);
    }
    else
    {      
      eval(`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config',  '${trackingID}');
      gtag('userId', '${nameId}');
    `);
    }
  }

  @override
  public onInit(): Promise<void> {

    this.context.application.navigatedEvent.add(this, this.navigatedEvent);

    return Promise.resolve();
  }
}