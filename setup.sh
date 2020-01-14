#!/usr/bin/env bash

# helper functions
. ./_functions.sh

# default args values
siteUrl=
trackingID=""
tenantSolutionDeployment=false
verbose=false
skipCustomAction=false
checkPoint=0
appId=

# script arguments
while [ $# -gt 0 ]; do
  case $1 in
    -s|--siteUrl)
      shift
      siteUrl=$1
      ;;
    --trackingID)
      shift
      trackingID=$1
      ;;
    --tenantSolutionDeployment)
      tenantSolutionDeployment=true
      ;;
    --skipCustomAction)
      skipCustomAction=true
      ;;
    --checkPoint)
      shift
      checkPoint=$1
      ;;
    --appId)
      shift
      appId=$1
      ;;
    --verbose)
      verbose=true
      ;;
    -h|--help)
      help
      exit
      ;;
    *)
      error "Invalid argument $1"
      exit 1
  esac
  shift
done

if [ -z "$siteUrl" ]; then
  error "Please specify site collection URL"
  echo
  help
  exit 1
fi

if [ -z "$trackingID" ]; then
  error "Please specify Tracking ID"
  echo
  help
  exit 1
fi

if [ "$tenantSolutionDeployment" = true ]; then
  # First, find the Tenant App Catalog
  msg "Retrieving tenant app catalog URL...\n"

  appCatalogUrl=$(o365 spo tenant appcatalogurl get)
  if [ -z "$appCatalogUrl" ]; then
    error "Couldn't retrieve Tenant App Catalog"
    exit 1
  fi
  if [ "$verbose" = true ]; then
    msg "Tenant App Catalog was find.\n"
  fi

  msg "Deploying the Google Tag Manager Package to the Tenant AppCatalog...\n"

  if (( $checkPoint < 100 )); then
    # Push package to the Tenant AppCatalog
    if [ "$verbose" = true ]; then
      msg "Adding the Google Tag Manager Package to the Tenant AppCatalog...\n"
    fi
    appId=$(o365 spo app add --filePath ./gtm-for-sharepoint.sppkg)

    if [ "$verbose" = true ]; then
      msg "App ID: $appId...\n"
    fi

    checkPoint=100
  fi
  if (( $checkPoint < 200 )); then
    # Deploy solution from the Tenant AppCatalog
    if [ "$verbose" = true ]; then
      msg "Deploying the Google Tag Manager Package...\n"
    fi
    o365 spo app deploy --name Google Tag Manager.sppkg --skipFeatureDeployment

    checkPoint=200
  fi
  if (( $checkPoint < 300 )); then
    # Install solution to site collection
    if [ "$verbose" = true ]; then
      msg "Installing the Google Tag Manager Package with ID: $appId...\n"
    fi
    o365 spo app install --id $appId --siteUrl $siteUrl

    checkPoint=300
  fi
else
  if (( $checkPoint < 100 )); then
    msg "Deploying the Google Tag Manager Package to the Site AppCatalog...\n"
    # Push package to the site AppCatalog
    if [ "$verbose" = true ]; then
      msg "Adding the Google Tag Manager Package to the Site AppCatalog $siteUrl...\n"
    fi
    appId=$(o365 spo app add --filePath ./gtm-for-sharepoint.sppkg --scope sitecollection --appCatalogUrl $siteUrl)

    if [ "$verbose" = true ]; then
      msg "App ID: $appId...\n"
    fi
    
    checkPoint=100
  fi
  if (( $checkPoint < 200 )); then
    # Deploy solution from the site AppCatalog
    if [ "$verbose" = true ]; then
      msg "Deploying the Google Tag Manager Package...\n"
    fi
    o365 spo app deploy --name gtm-for-sharepoint.sppkg --scope sitecollection --appCatalogUrl $siteUrl

    checkPoint=200
  fi
  if (( $checkPoint < 300 )); then
    # Install solution to site collection
    if [ "$verbose" = true ]; then
      msg "Installing the Google Tag Manager Package with ID : $appId...\n"
    fi
    o365 spo app install --id $appId --siteUrl $siteUrl --scope sitecollection

    checkPoint=300
  fi
fi

if [ "$skipCustomAction" = false ]; then
  msg "Enabling the Google Tag Manager extension...\n"

  # Add Custom action to site collection
  str="'{\"trackingID\":\"$trackingID\"}'"

  o365 spo customaction add --url $siteUrl --clientSideComponentId 87dac560-8541-4aef-b094-39b0a0d73985 --name 'Google Tag Manager for SharePoint' --title 'Google Tag Manager for SharePoint' --location 'ClientSideExtension.ApplicationCustomizer' --scope Site -p $str
fi
