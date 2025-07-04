import { STATES } from '@shell/plugins/dashboard-store/resource-class';
import { FLEET } from '@shell/config/types';
import { checkSchemasForFindAllHash } from '@shell/utils/auth';

// TODO use Rancher icons
const chartIcon = (type) => `<defs>
<!-- GIT REPO ICON -->
<svg id="git" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" style="enable-background:new 0 0 96 96" xml:space="preserve"><path class="st0" d="M92.138 43.888 52.018 3.77a5.918 5.918 0 0 0-8.369 0l-8.33 8.332L45.887 22.67a7.025 7.025 0 0 1 7.23 1.684 7.031 7.031 0 0 1 1.67 7.275l10.185 10.185a7.03 7.03 0 0 1 7.275 1.67 7.04 7.04 0 0 1 0 9.958 7.042 7.042 0 0 1-11.492-7.658l-9.5-9.499v24.997a7.09 7.09 0 0 1 1.861 1.331 7.042 7.042 0 1 1-7.65-1.537V35.849a7.04 7.04 0 0 1-3.822-9.234l-10.418-10.42-27.51 27.508a5.921 5.921 0 0 0 0 8.371l40.121 40.118a5.919 5.919 0 0 0 8.37 0l39.93-39.932a5.92 5.92 0 0 0 0-8.37z"/></svg>
<!-- GENERIC BUNDLE ICON -->
<svg id="bundle" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="#FFF"><path d="M16 3.2C8.931 3.2 3.2 8.931 3.2 16S8.931 28.8 16 28.8 28.8 23.069 28.8 16 23.069 3.2 16 3.2zm0 22.4c-5.302 0-9.6-4.298-9.6-9.6s4.298-9.6 9.6-9.6 9.6 4.298 9.6 9.6a9.6 9.6 0 0 1-9.6 9.6z"/><path d="m24.086 16-6.232-1.348.917-1.424-1.424.917-1.348-6.232-1.348 6.232-1.424-.917.917 1.424L7.912 16l6.232 1.348-.917 1.424 1.424-.917 1.348 6.232 1.348-6.232 1.424.917-.917-1.424L24.086 16zM16 16.814a.814.814 0 1 1 0-1.628.814.814 0 0 1 0 1.628z"/></svg>
<!-- HELM BUNDLE ICON -->
<svg id="helm" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500"><defs><style>.cls-1{fill:#fff}</style></defs><path class="cls-1" d="M136.53 121.135c-.573-.543-1.195-1.127-1.81-1.718-12.617-12.121-22.382-26.136-28.28-42.702-1.65-4.636-2.897-9.365-2.675-14.359.02-.473.02-.949.052-1.422.445-6.446 4.759-9.703 11.058-8.176a27.325 27.325 0 0 1 5.732 2.196c6.89 3.456 12.506 8.564 17.67 14.166A112.527 112.527 0 0 1 160 102.55a8.296 8.296 0 0 0 .39.86c.07.13.222.213.559.52a176.357 176.357 0 0 1 81.02-24.861c-.177-.876-.282-1.546-.448-2.2a112.494 112.494 0 0 1-2.653-36.957 84.075 84.075 0 0 1 4.445-21.764 31.326 31.326 0 0 1 5.476-10.17 15.687 15.687 0 0 1 3.164-2.822 7.026 7.026 0 0 1 8.032-.056 17.279 17.279 0 0 1 5.84 6.731 53.054 53.054 0 0 1 5.263 14.677 112.505 112.505 0 0 1 2.122 33.004 95.598 95.598 0 0 1-3.49 19.91c7.121 1.312 14.21 2.33 21.147 3.978a186.38 186.38 0 0 1 20.44 6.003 188.317 188.317 0 0 1 19.77 8.57c6.346 3.163 12.386 6.94 18.718 10.537.206-.433.505-.95.706-1.502a108.66 108.66 0 0 1 32.901-46.762 37.758 37.758 0 0 1 11.822-6.883 17.246 17.246 0 0 1 3.679-.845c6.264-.717 8.893 3.224 9.356 7.932a29.944 29.944 0 0 1-.774 10.354 87.906 87.906 0 0 1-10.73 24.688c-6.79 10.972-14.85 20.855-25.093 28.83-.302.236-.568.519-1.08.99a177.78 177.78 0 0 1 26.593 30.883 10.962 10.962 0 0 1-1.689.298c-10.595.015-21.19-.019-31.786.046a4.004 4.004 0 0 1-3.172-1.69 147.875 147.875 0 0 0-88.178-46.549 143.359 143.359 0 0 0-30.28-1.169 146.407 146.407 0 0 0-82.537 31.81 140.067 140.067 0 0 0-16.976 15.843 4.728 4.728 0 0 1-3.863 1.757c-10.121-.07-20.242-.035-30.363-.035h-2.152c.618-2.408 6.84-10.938 13.883-18.553 5.252-5.679 10.817-11.07 16.468-16.818ZM394.53 347.912a176.639 176.639 0 0 1-23.974 27.164l1.862 1.55a108.315 108.315 0 0 1 33.683 48.146 34.618 34.618 0 0 1 2.202 14.42 14.885 14.885 0 0 1-.748 3.692 7.208 7.208 0 0 1-8.157 5.023 22.233 22.233 0 0 1-6.763-2.006 51.232 51.232 0 0 1-9.182-5.815 107.592 107.592 0 0 1-32.936-46.707c-.187-.514-.392-1.02-.722-1.877a194.65 194.65 0 0 1-25.012 14.008 181.67 181.67 0 0 1-26.687 9.724 187.556 187.556 0 0 1-28.305 5.388c.168.84.265 1.51.438 2.16a109.172 109.172 0 0 1 2.97 36.442 80.804 80.804 0 0 1-4.422 22.478 78.25 78.25 0 0 1-4.165 8.744 13.39 13.39 0 0 1-2.339 2.971c-3.98 4.11-8.732 4.144-12.611-.074a27.28 27.28 0 0 1-3.907-5.617c-3.077-5.776-4.66-12.056-5.791-18.46a116.863 116.863 0 0 1-1.36-26.465 94.48 94.48 0 0 1 2.885-19.186c.14-.532.268-1.07.372-1.61.026-.137-.064-.297-.171-.738a176.121 176.121 0 0 1-80.969-24.994c-.41.91-.762 1.675-1.101 2.446a110.477 110.477 0 0 1-30.901 41.42 38.16 38.16 0 0 1-12.047 6.96 12.09 12.09 0 0 1-6.516.7 7.119 7.119 0 0 1-5.403-4.49c-1.416-3.424-1.165-6.985-.684-10.517a55.453 55.453 0 0 1 4.307-14.25 112.5 112.5 0 0 1 26.512-37.763c.459-.435.93-.857 1.38-1.3a3.76 3.76 0 0 0 .366-.655 178.905 178.905 0 0 1-28.47-31.317c.985-.08 1.644-.18 2.303-.18 10.514-.01 21.029.027 31.543-.044a4.706 4.706 0 0 1 3.703 1.626 146.946 146.946 0 0 0 39.403 28.885 139.947 139.947 0 0 0 49.704 14.774q70.68 6.87 121.6-42.854a7.646 7.646 0 0 1 5.992-2.444c9.802.121 19.605.05 29.408.05h2.534ZM350.736 197.762c2.787 0 5.47.189 8.115-.05 2.995-.271 5.139.8 7.323 2.813 12.613 11.622 25.357 23.1 38.059 34.627.638.58 1.29 1.144 2.11 1.87.764-.657 1.481-1.243 2.165-1.865q19.638-17.878 39.248-35.787a5.448 5.448 0 0 1 4.204-1.646c3.218.13 6.446.038 9.84.038V303.13c-1.722.504-24.875.604-27.638.061V249.83l-.537-.254-27.238 24.841-27.458-24.736-.524.192c-.023 4.454-.008 8.908-.01 13.362q-.005 6.64-.001 13.28v26.871h-27.428c-.514-1.773-.753-99.662-.23-105.623ZM97.634 197.882h27.264c.55 1.753.658 102.972.094 105.525H97.705c-.15-6.703-.048-13.384-.067-20.061-.018-6.623-.004-13.245-.004-20.04H63.847v39.741c-2.06.615-25.334.674-27.648.123V197.894h27.538v37.19c1.968.568 30.924.673 33.872.129.009-2.978.02-6.027.024-9.076q.007-4.744.001-9.487v-18.768ZM157.576 303.368V198.195c1.617-.53 61.545-.736 65.462-.205v22.414c-.879.063-1.786.184-2.693.185q-16.008.02-32.017.009h-2.968v17.433h33.347v23.192h-33.049c-.553 1.985-.705 15.817-.256 19.646.845.057 1.75.17 2.655.17q16.01.019 32.018.009h2.97v22.32ZM254.283 303.409c-.5-2.823-.4-103.602.097-105.518h27.162v77.765c1.172.06 2.092.149 3.011.15q16.128.014 32.256.006h2.908v27.597Z"/></svg>
<!-- RESOURCE DEPLOYMENT ICON -->
<svg id="deployment" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M24.01 20.027v2h-24v-2h4v-1a2.006 2.006 0 0 1-2-2v-10a2.006 2.006 0 0 1 2-2h1.996v2H4.01v10h16v-10h-2.004v-2h2.004a2.006 2.006 0 0 1 2 2l-.01 10a1.997 1.997 0 0 1-1.99 2v1Zm-9-6.012-3-3-3 3h2v2.01h2v-2.01Zm.995-7.991a4 4 0 1 1-4-4 4.001 4.001 0 0 1 4 4Zm-4.4 2.96v-.56a.802.802 0 0 1-.8-.8v-.4L9.06 5.479a2.958 2.958 0 0 0 2.545 3.505Zm2.658-1.007a2.977 2.977 0 0 0-1.068-4.704.797.797 0 0 1-.79.75h-.8v.8a.401.401 0 0 1-.4.4h-.8v.8h2.4a.401.401 0 0 1 .4.4v1.2h.4a.787.787 0 0 1 .658.354Z" fill="#fff"/></svg>
<!-- NODE ICON -->
<svg id="node" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="#fff"><circle cx="12" cy="3" r="1"/><circle cx="20" cy="8" r="1"/><circle cx="20" cy="16" r="1"/><circle cx="4" cy="8" r="1"/><circle cx="4" cy="16" r="1"/><path d="M20 14v-4a1.992 1.992 0 0 1-1.481-3.333l-4.783-2.69a1.983 1.983 0 0 1-3.472 0l-4.783 2.69A1.992 1.992 0 0 1 4 10v4a1.992 1.992 0 0 1 1.481 3.333l4.783 2.69a1.991 1.991 0 0 1 1.236-.952v-5.142a2 2 0 1 1 1 0v5.142a1.991 1.991 0 0 1 1.236.953l4.783-2.69A1.992 1.992 0 0 1 20 14Z"/><circle cx="12" cy="21" r="1"/><circle cx="12" cy="12" r="1"/></g></svg>
<!-- RESOURCE OTHER ICON -->
<svg id="other" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#FFF"><path d="M27.476 10.22H14.83l-1.558-3.115a1.327 1.327 0 0 0-1.184-.732H4.522c-.731 0-1.324.593-1.324 1.324v16.606c0 .731.593 1.324 1.324 1.324h22.953c.731 0 1.324-.593 1.324-1.324v-12.76c0-.731-.593-1.324-1.324-1.324z"/></svg>
</defs>
<use id="customIcon" href="#${ type }" fill="#fff" />`;

// some default values
const defaultNodeRadius = 20;
const defaultNodePadding = 15;
const chartWidth = 800;
const chartHeight = 500;
const fdcStrength = -300;
const fdcDistanceMax = 500;
const fdcForceCollide = 80;
const fdcAlphaDecay = 0.05;

// setting up default sim params
// check documentation here: https://github.com/d3/d3-force#forceSimulation
const simulationParams = {
  fdcStrength,
  fdcDistanceMax,
  fdcForceCollide,
  fdcAlphaDecay
};

/**
 * Represents a config object for FDC type
 * @param {Function} parseData - Parses the specific data for each chart. Format must be compliant with d3 data format
 * @example data format => { parent: {..., children: [ {..., children: []} ] } }
 * @param {Function} extendNodeClass - Extends the classes for each node so that the styling is correctly applied
 * @param {Function} nodeDimensions - Sets the radius of the nodes according each data type
 * @param {Function} infoDetails - Prepares the data to be displayed in the info box on the right-side of the ForceDirectedTreeChart component
 */
export const graphConfig = {
  chartWidth,
  chartHeight,
  simulationParams,
  /**
     * data prop that is used to trigger the watcher in the component. Should follow format "data.xxxxxx"
     */
  watcherProp: 'data.bundles',
  /**
     * Mandatory params for a child object in parseData (for statuses to work)
     * @param {String} state
     * @param {String} stateDisplay
     * @param {String} stateColor
     * @param {String} matchingId (this can be different than the actual ID, depends on the usecase)
     */
  parseData:   (data) => {
    const bundles = data.bundles.map((bundle) => {
      const bundleLowercaseState = bundle.state ? bundle.state.toLowerCase() : 'unknown';
      const bundleStateColor = STATES[bundleLowercaseState].color;

      const appChild = {
        id:             bundle.id,
        type:           bundle.type,
        matchingId:     `${ bundle.type }-${ bundle.id }`,
        state:          bundle.state,
        stateLabel:     bundle.stateDisplay,
        stateColor:     bundleStateColor,
        errorMsg:       bundle.stateDescription,
        detailLocation: bundle.detailLocation,
        children:       []
      };

      const bds = data.bundleDeployments.filter((bd) => bundle.id === `${ bd.metadata?.labels?.['fleet.cattle.io/bundle-namespace'] }/${ bd.metadata?.labels?.['fleet.cattle.io/bundle-name'] }`);

      bds.forEach((bd) => {
        const bdLowercaseState = bd.state ? bd.state.toLowerCase() : 'unknown';
        const bdStateColor = STATES[bdLowercaseState]?.color;

        const cluster = data.clustersList.find((cluster) => {
          const clusterString = `${ cluster.namespace }-${ cluster.name }`;

          return bd.id.includes(clusterString);
        });

        appChild.children.push({
          id:                    bd.id,
          type:                  bd.type,
          matchingId:            `${ bd.type }-${ bd.id }`,
          clusterLabel:          cluster ? cluster.namespacedName : undefined,
          clusterDetailLocation: cluster ? cluster.detailLocation : undefined,
          state:                 bd.state,
          stateLabel:            bd.stateDisplay,
          stateColor:            bdStateColor,
          errorMsg:              bd.stateDescription,
          detailLocation:        bd.detailLocation,
        });
      });

      return appChild;
    });

    const appLowercaseState = data.state ? data.state.toLowerCase() : 'unknown';
    const appStateColor = STATES[appLowercaseState].color;

    return {
      id:             data.id,
      type:           data.type,
      matchingId:     `${ data.type }-${ data.id }`,
      state:          data.state,
      stateLabel:     data.stateDisplay,
      stateColor:     appStateColor,
      errorMsg:       data.stateDescription,
      detailLocation: data.detailLocation,
      children:       bundles,
      muteStatus:     true
    };
  },
  /**
   * Used to add relevant classes to each main node instance
   */
  extendNodeClass: ({ data }) => {
    const classArray = [];

    if (data?.type) {
      const nodeType = data.type.replaceAll('fleet.cattle.io.', '');

      classArray.push(nodeType);
    }

    return classArray;
  },
  /**
   * Used to add the correct icon to each node
   */
  fetchNodeIcon: ({ data }) => {
    let type = '';

    switch (data?.type) {
    case FLEET.GIT_REPO:
      type = 'git';
      break;
    case FLEET.HELM_OP:
      type = 'helm';
      break;
    case FLEET.BUNDLE:
      if (data?.id.indexOf('helm') !== -1) {
        type = 'helm';
      }

      type = 'bundle';
      break;
    case FLEET.BUNDLE_DEPLOYMENT:
      type = 'node';
      break;
    }

    return chartIcon(type);
  },
  /**
     * Used to set node dimensions
     */
  nodeDimensions: ({ data }) => {
    if (data?.type === FLEET.GIT_REPO || data?.type === FLEET.HELM_OP) {
      const radius = defaultNodeRadius * 3;
      const padding = defaultNodePadding * 2.5;

      return {
        radius,
        size:     (radius * 2) - padding,
        position: -(((radius * 2) - padding) / 2)
      };
    }
    if (data?.type === FLEET.BUNDLE) {
      const radius = defaultNodeRadius * 2;
      const padding = defaultNodePadding;

      if (data?.id.indexOf('helm') !== -1) {
        return {
          radius,
          size:     (radius * 1.5) - padding,
          position: -(((radius * 1.5) - padding) / 2)
        };
      }

      return {
        radius,
        size:     (radius * 1.7) - padding,
        position: -(((radius * 1.7) - padding) / 2)
      };
    }

    return {
      radius:   defaultNodeRadius,
      size:     (defaultNodeRadius * 2) - defaultNodePadding,
      position: -(((defaultNodeRadius * 2) - defaultNodePadding) / 2)
    };
  },
  /**
     * Use @param {Obj} valueObj for compound values (usually associated with a template of some sort on the actual component)
     * or @param value for a simple straightforward value
     */
  infoDetails: (data) => {
    const moreInfo = [
      {
        type:     'resource-type',
        labelKey: 'fleet.fdc.type',
        valueKey: data.type
      },
      {
        type:     'title-link',
        labelKey: 'fleet.fdc.id',
        valueObj: {
          label:          data.id,
          detailLocation: data.detailLocation
        }
      }
    ];

    if (data?.type === FLEET.BUNDLE_DEPLOYMENT) {
      moreInfo.push({
        type:     'title-link',
        labelKey: 'fleet.fdc.cluster',
        valueObj: {
          label:          data.clusterLabel,
          detailLocation: data.clusterDetailLocation
        }
      });
    }

    moreInfo.push({
      type:     'state-badge',
      labelKey: 'fleet.fdc.state',
      valueObj: {
        stateColor: data.stateColor,
        stateLabel: data.stateLabel
      }
    });

    if (data.errorMsg) {
      moreInfo.push({
        type:     'single-error',
        labelKey: 'fleet.fdc.error',
        value:    data.errorMsg
      });
    }

    return moreInfo;
  },

  checkSchemaPermissions: async(store) => {
    const schemas = await checkSchemasForFindAllHash({
      cluster: {
        inStoreType: 'management',
        type:        FLEET.CLUSTER
      },
      bundle: {
        inStoreType: 'management',
        type:        FLEET.BUNDLE,
        opt:         { excludeFields: ['metadata.managedFields', 'spec.resources'] },
      },
      bundleDeployment: {
        inStoreType: 'management',
        type:        FLEET.BUNDLE_DEPLOYMENT
      }
    }, store);

    return schemas.cluster && schemas.bundle && schemas.bundleDeployment;
  }
};
