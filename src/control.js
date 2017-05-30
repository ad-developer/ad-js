/* ========================================================================
 * ad-js framework
 * control.js v1.0.0
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


/**
 *
 */
export default class Control {

  /**
   * init - Object initialization method.
   *
   * @param  {string} id     Control id.
   * @param  {object} json   Json object representing this control
   * @param  {string} state  State of the control to be displayed. It can be
   * form, edit, or view.
   * @param  {object} model  Model to the control to be bind to.
   * @param  {object} parent Parent control (container).
   * @param  {number} index  Index within parent control (container).
   */
  init(id, json, state, model, parent, index){
    let $this = this,
        el = null,
        meta,
        ctrls;
    $this.state_ = state || 'form';
    $this.model_ = model;
    $this.control_ = null,
    $this.attr_ = {},
    $this.built_ = false;
    $this.path = null;
    $this.parent_ = parent;

    // Set attributes
    if(json){
      meta = json;
      id = json.id;
    } else {
      meta = id;
    }

    $this.id_ = id;

    el = util.el(id);

    // Am I a container...
    if(json && json.cs || id && el.hasChildNodes()){
      $this.controls_ = [];
      // ... and I want to be added to container collection
      ad.addContainer(id, $this, parent, index);
    }

    // Set Json
    if(!json){
      json = util.convertDomToJson(el);
    }
    $this.json_ = json;

    // Check if the parent Json has this Json branch
    // in case of replacement
    if(parent && index){
      ctrls = parent.getControls();
      if(ctrls){
        json = ad.locateObj($this.getRootContainer_().getJson(), parent.path);
        if(!json.cs[index] || json.cs[index] && json.cs[index].id !== id){
          json.cs.splice(index, 1, $this.json_);
        }
      }
    }

    $this.setAttr_(meta);
  }

  /**
   * getRootContainer_ - description
   *
   * @param  {type} con description
   * @return {type}     description
   */
  getRootContainer_(con){
    let p = this.getParent();

    if(p){
      con = p.getRootContainer_(p);
    }
    return con;
  },
};
