/* ========================================================================
 * ad-js framework
 * control-manager.js v1.0.0
 * ========================================================================
 * Copyright 2017 A. D.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */

'use strict';


let controlManager = controlManager || {};


/**
 * Key/Value (map) object to keep controls.
 * @private
 */
controlManager.controls_ = {};

/**
 * Key/Value (map) object to keep data sources.
 * @private
 */
controlManager.dataSources_ = {};

/**
 * Key/Value (map) object to keep modules.
 * @private
 */
controlManager.modules_ = {};

/**
 * Key/Value (map) object to keep containers.
 * @private
 */
controlManager.containers_ = {};

/**
 * Key/Value (map) object to keep states.
 * @private
 */
controlManager.state_ = {};

/**
 * Pre pad text to form global id.
 * @private
 */
controlManager.gpad_ = 'ad';

/**
 * Next global id index.
 * @private
 */
controlManager.gid_ = 1;


/**
 *  Generates next clobal id.
 * @return {string}  description
 */
controlManager.guid = function() {
  return this.gpad_ + this.gid_++;
};


/**
 * Method to registers controls.
 *
 * @param  {string} name   A tag name or Json node name example "ad-text";
 * @param  {Control} control   Control class.
 */
controlManager.registerControl = function(name, control){
  this.controls_[name] = control;
};


/**
 * Method to register datasources.
 *
 * @param  {string} name       DataSource name.
 * @param  {DataSource} dataSource DataSource class.
 */
controlManager.registerDataSource = function(name, dataSource){
  this.dataSources_[name] = dataSource;
};


/**
 * Method to register modules.
 *
 * @param  {string} name   Madule name.
 * @param  {Module} module Module class.
 */
controlManager.registerModule = function(name, module){
  this.modules_[name] = module;
};


/**
 * Getter to get a datasource instance object.
 *
 * @param  {string} name DataSorce name
 * @return {object}      DataSource class instance object.
 */
controlManager.getDataSource = function(name){
  let ds = this.dataSources_[name];
  if(ds){
    return new ds();
  }
};


/**
 * Getter to get a module instatnce object.
 *
 * @param  {string} name Module name.
 * @return {object}      Module class instance object.
 */
controlManager.getModule = function(name){
  return this.modules_[name];
};


/**
 * Method to build container path. Used as a key to save/retrieve container
 * object from containers_ map.
 *
 * @param  {object} container Container object.
 * @param  {object} parent    Parent Object
 * @param  {number} index     Position withing parent collection of controls.
 * @return {string}           New calculated path.
 */
controlManager.getContainerPath = function(container, parent, index){
  let p = parent.path;
  if(p !== ''){
    p += '.';
  }
  p += 'cs[' + index + ']';
  return p;
};


/**
 * Method to add a container to containers_ map;
 *
 * @param  {string} id        Container id.
 * @param  {object} container Container object.
 * @param  {object} parent    Parent object.
 * @param  {number} index     Position withing parent collection of controls.
 */
controlManager.addContainer = function(id, container, parent, index){
  let path = '';
  if(parent){
    path = this.getContainerPath(container, parent, index);
  }
  container.path = path;
  this.containers_[id] = container;
},


/**
 * Getter to get container object from containers_ map;
 *
 * @param  {string} id Container id.
 * @return {object}    Container object.
 */
controlManager.getContainer = function(id){
  return this.containers_[id];
};


/**
 * Getter to get control class from controls_ map;
 *
 * @param  {string} name Control name.
 * @return {Control}     Control class.
 */
controlManager.getControl = function(name){
  var c = this.controls_[name];
  if(!c){
    c = this.resolveTag(name);
  }
  return c;
};


/**
 * resolveTag - description
 *
 * @param  {type} name description
 * @return {type}      description
 */
controlManager.resolveTag = function(name){
  return class ClassName extends Control {
    renderDom(name){
      let ctrl = util.elCreate(name),
          i = 0,
          el;
      for (el in this.attr_) {
        if (this.attr_.hasOwnProperty(el)) {
          if(el === 'ad_inner_text'){
            ctrl.text(this.attr_[el]);
          } else {
            ctrl.attr(el, this.attr_[el]);
          }
        }
      }
      if(this.controls_ && this.built_){
        for (; el = this.controls_[i++];) {
          el.setState(this.state_, this.model_);
        }
      }
      this.control_ = ctrl;
      this.built_ = true;
    }
  };
};


/**
 * Method to resolve (translate) dom structure of the dom node into Json object.
 *
 * @param  {object} domObj Dom object.
 * @return {object}       Json object.
 */
controlManager.resolveJson = function(domObj){
  /* new implementation */
  let obj = {},
      arrObj = [],
      attr = domObj.attributes,
      tag = domObj.tagName.toLowerCase();


  obj.c = tag;

  for (let i = 0, el; i < attr.length; i++) {
    el = attr[i];
    tag = el.value;
    // Make sure not to add display: none; as a
    // value of style attribute
    if (el.value.indexOf('display: none;') >= 0){
      tag = tag.replace('display: none;','');
    }
    obj[el.name] = tag;
  }

  // Check if element has an inner text
  tag = domObj.textContent;
  if(tag.length){
    obj.ad_inner_text  = tag;
  }

  // Dealing with children.
  if(domObj.hasChildNodes() > 0){
    for (let i = 0, el; i < domObj.children.length; i++) {
      el = domObj.children[i];
      // Id needs to be added if missing
      // This behavior will be controlled through
      // the settings (TODO: Not implemented yet.)
      if(el.id){
        el.setAttribute('id', this.guid());
      }
      arrObj.push(this.resolveJson(el));
    }
    obj.cs = arrObj;
  }

  return obj;
};


/**
 * controlManager - description
 *
 * @param  {type} obj  description
 * @param  {type} path description
 * @return {type}      description
 */
controlManager.locateObj = function(obj, path){
  if(path === ''){
    return obj;
  }
   path = path.split('.');
   var arrayPattern = /(.+)\[(\d+)\]/;
   for (var i = 0; i < path.length; i++) {
     var match = arrayPattern.exec(path[i]);
     if (match) {
       obj = obj[match[1]][parseInt(match[2])];
     } else {
       obj = obj[path[i]];
     }
   }

   return obj;
};

window.ad = window.ad || controlManager;
