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
  }
};
