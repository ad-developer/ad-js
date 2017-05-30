/* ========================================================================
 * ad-js framework
 * util.js v1.0.0
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


const util = {

  /**
   * Wrapper around document getElementById
   *
   * @param  {string} name Element Id
   * @return {object}      Dom element object.
   */
  el(name) {
    return document.getElementById(name);
  },

  /**
   * elCreate - description
   *
   * @param  {string} tagName Tag name.
   * @return {object}    Newly created dom element object.
   */
  elCreate(tagName) {
    return document.createElement(tagName)
  },

  /**
   * Returns true if the specified value is a string.
   * @param {?} val Variable to test.
   * @return {boolean} Whether variable is a string.
   */
  isString = function(val) {
    return typeof val == 'string';
  },

  /**
   * convertDomToJson - Method to convert dom structure into the Json object.
   * This method add missing Id(s) to dom element(s) and resulting Json object
   * nodes. This is a default implementation and is not controlled at this
   * moment... it can be added as an opt-out feature in the future
   * implementation.
   * @param  {object} domObj Dom object.
   * @return {object}       Json object.
   */
  convertDomToJson(domObj){

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
    if(domObj.hasChildNodes()){
      for (let i = 0, el; i < domObj.children.length; i++) {
        el = domObj.children[i];
        // Id needs to be added if missing
        // This behavior will be controlled through
        // the settings (TODO: Not implemented yet.)
        if(el.id){
          el.setAttribute('id', this.guid());
        }
        arrObj.push(util.convertDomToJson(el));
      }
      obj.cs = arrObj;
    }

    return obj;
  }
};
