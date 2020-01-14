help() {
  echo
  echo "xFx Google Tag Manager for SharePoint"
  echo
  echo "Usage: ./setup.sh [options]"
  echo
  echo "Options:"
  echo
  echo "--help                                                  Output usage information"
  echo "-s, --siteUrl <tenantUrl>                               URL of the site to provision and/or enable the extension"
  echo "--trackingID <trackingID>                               Google tag Manager Tracking ID"
  echo "--tenantSolutionDeployment [tenantSolutionDeployment]   Set 'true', to deploy the solution package to the whole tenant. If not specified, the package will be deployed to the current Site App Catalog"
  echo "--skipCustomAction [skipCustomAction]                   Don't enable the custom action to the target site"
  echo "--checkPoint [checkPoint]                               Check point from which to resume executing the setup script"
  echo "--appId [appId]                                         Product ID of the App from the App Catalog. Use only at checkpoint '200'"
  echo "--verbose [verbose]                                     Runs setup with verbose logging"
  echo
  echo "Example:"
  echo
  echo "  Deploy and enable Google Analytics extension"
  echo "    ./setup.sh --siteUrl https://contoso.sharepoint.com --trackingID 'GTM-0000000'"
  echo
}

msg() {
  printf -- "$1"
}
