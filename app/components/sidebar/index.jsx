import React from 'react';
import angular from 'angular';
import { storage } from '../../utils/storage';
import module from '../module';
import { FWC_MENU } from '../../utils/biz/meta/menu';
import { OEM } from '../../utils/biz/meta/domain';
import $ from 'jquery';
import { pick, flatMapDeep, flatMap } from 'lodash-es';

import { isTemplate, isInTenant } from '../../utils/biz/common';
import {
  APPLICATIONS_ADD_SREF,
  CONTRACTS_SREF,
  CONTRACT_MANAGEMENT_SREF,
  TENANTMANAGEMENT_ADD_SREF,
  NO_PERMISSION_SREF,
  ROLE_MANAGEMENT_DLG_SREF,
  INCIDENT_MONITOR,
  CUSTOM_BLOCK_PAGE_DLG_SELF,
  WAF_GATEWAYS,
  ATTACK_LOGS,
} from '../../utils/biz/meta/state';
import { USER_ROLE, DEMO_USER_EMAIL, LINKS } from '../../utils/biz/meta/index';
import { CLOUD_PLATFORMS } from '../../utils/biz/meta/cloudPlatforms';
import { react2angular } from 'react18-react2angular';

const Sidebar = (props) => {
  const $ctrl = props.store;
  return (
    <div class="sidebar" data-background-color="white" data-active-color="info">
      <div class="logo" ng-if={!$ctrl.isMssp}>
        <a href="/" class="simple-text logo-mini">
          <img src="/styles/img/fortiweb-cloud.svg" class="a_img" />
        </a>
        <a href="/" class="simple-text logo-normal">
          {'product_name' | translate}
        </a>
      </div>
      <div class="logo" ng-if={$ctrl.isMssp && $ctrl.inTenant}>
        <a href="/" class="simple-text logo-mini">
          <img src="/styles/img/fortiweb-cloud.svg" class="a_img" />
        </a>
        <a onClick={$ctrl.backToMssp()} class="simple-text logo-normal menu-text">
          Back To MSSP Portal
        </a>
      </div>
      <div class="sidebar-wrapper">
        <ul class="nav">
          <li
            ng-repeat={item in $ctrl.menuItems}
            class={`${item.id == $ctrl.currentItem ? 'active' : ''} ${['global', 'mssp', 'threat_analytics_group'].includes(item.id) ? 'menu-item-separate' : ''}`}
          >
            <a ng-if="item.children" data-toggle="collapse" href="{'#' + item.id}">
              <i class="{item.icon}">
                <img ng-if="item.id == 'mssp'" src="/styles/img/fortiweb-cloud.svg" class="a_img" />
              </i>
              <p>
                {item.label | translate} <b class="caret"></b>
              </p>
            </a>
            <a ng-if="item.sref" ui-sref={$ctrl.isTemplate && item.tplsref ? item.tplsref : item.sref}>
              <i class="{item.icon}">
                <img ng-if="item.id == 'mssp'" src="/styles/img/fortiweb-cloud.svg" class="a_img" />
              </i>
              <p>
                {item.label | translate} &nbsp;
                <span ng-if="item.id == 'threat_analytics'" class="beta">
                  {'New' | translate}
                </span>
              </p>
            </a>
            {/* l2 */}
            <div class="collapse" id={item.id}>
              {item.children && (
                <ul class="nav">
                  <li ng-repeat="child in item.children" class={child.id == $ctrl.currentChild ? 'active' : ''}>
                    <a ng-if="!child.children" ui-sref={$ctrl.isTemplate && child.tplsref ? child.tplsref : child.sref}>
                      <span class="sidebar-mini">{child.mini}</span>
                      <span class="sidebar-normal">
                        {child.label | translate} &nbsp;
                        <span ng-if="child.id == 'waiting_room'" class="beta">
                          {'Beta' | translate}
                        </span>
                      </span>
                    </a>
                    <a ng-if="child.children" data-toggle="collapse" href="{'#' + child.id}">
                      <span ng-if="child.mini" class="sidebar-mini" style="line-height: 30px;">
                        {child.mini}
                      </span>
                      <p>
                        {child.label | translate} <b class="caret"></b>
                      </p>
                    </a>
                    {/* l3 */}
                    <div class="collapse" id="{child.id}">
                      <ul class="nav" ng-if="child.children">
                        <li ng-repeat="child in child.children" class={child.id == $ctrl.currentChild ? 'active' : ''}>
                          <a ng-if="!child.children" ui-sref={$ctrl.isTemplate && child.tplsref ? child.tplsref : child.sref}>
                            <span class="sidebar-mini" style="text-transform: none;">
                              {child.mini}
                            </span>
                            <span class="sidebar-normal" style="margin-left:60px;">
                              {child.label | translate}
                            </span>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </li>
                </ul>
              )}
            </div>
          </li>
          <li ng-if={!$ctrl.minimize && !$ctrl.isNoPermission}>
            <a onClick={$ctrl.addModule()}>
              <i class="ti-plus"></i>
              <p>Add Modules</p>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

module.component('sidebar', react2angular(Sidebar, [], ['$state', '$stateParams', 'auth', 'dataService']));
