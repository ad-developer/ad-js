/* ========================================================================
 * adpresso-ui framework
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

 +function($){
   "use strict";

    /**
     * controlManager - global static object to handle all major framework functions.
     */
    var controlManager  = {
        controls_: {},
        dataSources_: {},
        modules_: {},
        containers_: {},
        state_: {},
        gpad_: 'ad',
        gid_: 1,
        guid: function() {
          return this.gpad_ + this.gid_++;
         },
        inherits: function(childCtor, parentCtor) {
      		  /** @constructor */
      		  function tempCtor() {}
      		  tempCtor.prototype = parentCtor.prototype;
      		  childCtor.superClass_ = parentCtor.prototype;
      		  childCtor.prototype = new tempCtor();
      		  /** @override */
      		  childCtor.prototype.constructor = childCtor;
      	  	childCtor.base = function(me, methodName, var_args) {
      	    	var args = new Array(arguments.length - 2);
      	    	for (var i = 2; i < arguments.length; i++) {
      	      		args[i - 2] = arguments[i];
      	    	}
      	    	return parentCtor.prototype[methodName].apply(me, args);
      	  	};
      	},

        /**
         *
         *
         * registerControl - method to register a control. Control will be
         * registered only one time.
         *
         * @param  {string} name  Is a tag name or Json node name example
         * "ad-text";
         * @param  {function} control Constructor of a control. Control object
         * will be instantiated for each occurence of the control in the meta
         * data.
         */
        registerControl: function(name, control){
          this.controls_[name] = control;
        },

        /**
         * registerDataSource - method to register a data source. Data
         * source will be registered only one time.
         *
         * @param  {string} name       description
         * @param  {object} dataSource description
         */
        registerDataSource: function(name, dataSource){
          this.dataSources_[name] = dataSource;
        },
        registerModule: function(name, module){
          this.modules_[name] = module;
        },
        getDataSource: function(name){
          var ds = this.dataSources_[name];
          if(ds){
            return new ds();
          }
        },
        getModule: function(name){
          return this.modules_[name];
        },
        getContainerPath: function(container, parent, index){
          var p = parent.path;
          if(p !== ''){
            p += '.';
          }
          p += 'cs[' + index + ']';
          return p;
        },

        /**
         * addContainer - description
         *
         * @param  {string} id        description
         * @param  {object} container description
         * @param  {object=} parent    description
         */
        addContainer: function(id, container, parent, index){
          var path = '';
          if(parent){
            path = this.getContainerPath(container, parent, index);
          }
          container.path = path;
          this.containers_[id] = container;
        },
        getContainer: function(id){
          return this.containers_[id];
        },
        getControl: function(name){
          var c = this.controls_[name];
          if(!c){
            c = this.resolveTag(name);
          }
          return c;
        },
        resolveTag: function(name){
          var NewClass = function(){
            controlManager.Control.call(this);
          };
          controlManager.inherits(NewClass, controlManager.Control);
              NewClass.prototype.renderDom = function(){
                var ctrl = $('<' + name + '/>' ),
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
              };
          return NewClass;
        },
        resolveJson: function(jqObj){
          var obj = {},
              arrObj = [],
              attr = jqObj[0].attributes,
              tag = jqObj.prop('tagName').toLowerCase(),
              i = 0,
              el;

          obj.c = tag;

          for (;el = attr[i++];) {
            tag = el.value;
            // Make sure not to add display: none; as a
            // value of style attribute
            if (el.value.indexOf('display: none;') >= 0){
              tag = tag.replace('display: none;','');
            }
              obj[el.name] = tag;
          }

          // Check if element has an inner text
          tag = jqObj
          .clone()    //clone the element
          .children() //select all the children
          .remove()   //remove all the children
          .end()
          .text()
          .trim();
          if(tag.length){
            obj.ad_inner_text  = tag;
          }


          if(jqObj.children().length > 0){
            jqObj.children().each(function(){
              // Id needs to be added if missing
              if(!$(this).attr('id')){
                $(this).attr('id', controlManager.guid());
              }
              arrObj.push(
                controlManager.resolveJson($(this))
              );
            })
            obj.cs = arrObj;
          }
          return obj;
        },
        locateObj: function(obj, path){
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
        },
        getParentAndIndex: function(path){
          var p = path.substr(0, path.length - 3),
              i = path.substr(path.length - 2, 1)
          return {
            // path
            p: p,
            // index
            i: parseInt(i)
          };
        },
        purge: function(id){
          // remove this container and all subcontainers from containers_ list
          // remove this from json path
          // remove this control from parent controls
          var con = this.containers_[id],
              parent,
              path,
              el,
              i = 0;
          if(!con){
            return;
          }
          parent = con.getParent();
          path = con.path;
          delete this.containers_[id];

          for (el in this.containers_) {
            if (this.containers_.hasOwnProperty(el)) {
              if(this.containers_[el].path.startsWith(path)){
                delete this.containers_[el];
              }
            }
          }
          // if no parent then it's a root container the entire json
          // object needs to be deleted
          if(!parent){
            el = con.getJson();
            el = {};
            return;
          }
          path = this.getParentAndIndex(path);

          con = this.locateObj(parent.getJson(), path.p);

          // remove json branch from parent
          con.splice(path.i, 1);

          path = parent.getControls();
          i = 0;
          for (;con = path[i++];) {
            if(con.getId() === id){
              i = i - 1;
               path.splice(i, 1);
               break;
            }
          }
          return {
            p: parent,
            i: i
          };
        },
        /**
         * apply - description
         *
         * @param  {string|object} meta  Meta can be either container id
         * or json object representing the content of the contaiern. I cases
         * of the container id a html markup represents content of the
         * container.
         * @param  {object=} model Represent a model of the container
         * controls.
         * @param  {string=} state State of the control(s) it can be
         * form, edit, or view.
         * @return {type}       description
         */
        apply: function(meta, model, state){
          var id,
              tag,
              controlObj,

              // json format
              // { contId: "id", controls: [{tag: "name", attribute: "value", attribute: "value"}, ..., ]}
              json,
              content,
              po,
              i;

          // See if meta is a container id
          if($.type(meta) === 'string'){
            id = meta;

          // Otherwise it is a json meta data to build a container's
          // content.
          } else {
            id = meta.id;
  					json = meta;
          }

          // Hide container untill it's rendered in full.
          $('#' + id).hide();
          tag = $('#' + id).prop('tagName').toLowerCase();

          // Make instance of the corresponding
          // container control
          controlObj = controlManager.getControl(tag);
          controlObj = new controlObj();

          // We get a parent container and the position back here
          // in case of replacement
          po = controlManager.purge(id)
          tag = null;
          if(po){
            tag = po.p;
            i = po.i
          }
          // Build container control
          content = controlObj.build(id, json, model, state, tag, i);

          content.show();

          // Finally inject the content
          // and show the container.
          $('#' + id)
          .replaceWith(content)
          .fadeIn('slow');

        }
    };

    controlManager.Control = function(){};
    controlManager.Control.prototype = {
        init: function(id, json, state, model, parent, index){
          var $this = this,
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

          // Am I a container...
          if(json && json.cs || id && $('#' + id).children().length > 0){
            $this.controls_ = [];
            // ... and I want to be added to container collection
            cm.addContainer(id, $this, parent, index);
          }

          // Set json
          if(!json){
            json = controlManager.resolveJson($('#' + id));
          }
          $this.json_ = json;

          // We need to check if the parent json has this Json branch
          // in case of replacement
          if(parent && index){
            ctrls = parent.getControls();
            if(ctrls){
              json = cm.locateObj($this.getRootContainer_().getJson(), parent.path);
              if(!json.cs[index] || json.cs[index] && json.cs[index].id !== id){
                json.cs.splice(index, 1, $this.json_);
              }
            }
          }

          $this.setAttr_(meta);
        },
        getRootContainer_: function(con){
          var p = this.getParent();

          if(p){
            con = p.getRootContainer_(p);
          }
          return con;
        },
        getJson: function(){
          return this.json_;
        },
        set: function(obj){},
        get: function(id){
          var val;
          // In case of continer...
          if(this.controls_ && !this.control_.is('select')){
            cm.Control.data_ = cm.Control.data_ || {};
            if(!id){
              id = this.id_;
              cm.Control.data_[id] = {};
            }

            for (var i = 0, el; el = this.controls_[i++];) {
                if(el.controls_ && !el.control_.is('select')){
                  el.get(id);
                } else {
                  if(el.get() !== undefined){
                    cm.Control.data_[id][el.id_] = el.get();
                  }
                }
            }
            return cm.Control.data_[id];
          // ... also it's implemented for the
          // successful controls
          } else {
            // text box or textarea or select
            if(this.control_.is(':text, textarea, select')){
                val = this.control_.val();
            }
            // checkbox or radio
            if(this.control_.is(':checkbox, :radio')){
              val = this.control_.is(':checked');
            }
            return val;
          }
        },
        show: function() {
          this.control_.show();
        },
        hide: function(){
          this.control_.hide();
        },
        getAttributes: function(){
          return this.attr_;
        },
        setAttr_: function(meta){
          var attr,
              i = 0,
              el;
          if($.type(meta) === 'string'){
            attr = $('#' + meta)[0].attributes;
            for (;el = attr[i++];) {
              if(!$.isArray(el)){
                this.attr_[el.name] = el.value;
              }
            }
            // Assumption: we add custom attribute ad_inner_text
            // to hold inner text content ( if any ) of the given
            // control.
            attr = $('#' + meta)
            .clone()    //clone the element
            .children() //select all the children
            .remove()   //remove all the children
            .end()
            .text()
            .trim();
            if(attr.length){
              this.attr_.ad_inner_text  = attr;
            }

          } else {
            for (el in meta) {
              if (meta.hasOwnProperty(el)) {
                if(el !== 'cs' && el !== 'c'){
                  this.attr_[el] = meta[el];
                }
              }
            }
          }
        },
        getId: function(){
          return this.id_;
        },
        getParent: function(){
          return this.parent_;
        },
        setState: function(state, model){
          this.state_ = state;
          this.model_ = model;
          this.renderDom();
        },
        getControlById: function(id){
          if(this.controls_){
            return this.controls_[id];
          }
        },
        getControls: function(){
          return this.controls_;
        },
        exec: function(method, par){
          if(this[method]){
            this[method](par);
          }
        },
        renderDom: function(){},
        build: function(id, json, model, state, parent, index){
          var $this = this,
              i = 0,
              cntrl,
              tag,
              html = '',
              pCtrls,
              addToParent;
          if(id instanceof jQuery){
            cntrl = controlManager.guid();
            id.attr('id', cntrl);
            id = cntrl;
            cntrl = undefined;
          }
          $this.init(id, json, state, model, parent, index);

          // Check if it is already in the parent controls_ list
          // of controls in case of replacement.
          if(parent && index){
            pCtrls = parent.getControls();
            if(pCtrls){
              addToParent = true;
              for (; tag = pCtrls[i++];) {
                if(tag.getId() === id){
                  addToParent = false;
                  break;
                }
              }
              if(addToParent){
                pCtrls.splice(index, i, $this);
              }
            }
          }

          // Render itself
          $this.renderDom();

          // If a container then renders all children
          // and add them to itself
          if($this.controls_){
            i = 0;
            if(json){
              for (; tag = json.cs[i++];) {
                cntrl = controlManager.getControl(tag.c);
                cntrl = new cntrl();
                $this.controls_.push(cntrl);
                $this.control_.append(
                  cntrl.build(null, tag, model, state, $this, i - 1)
                );
              }
            } else {
              $('#' + id).children().each(function(){
                  cntrl = $(this);
                  tag = cntrl.prop('tagName').toLowerCase();
                  tag = controlManager.getControl(tag);
                  tag = new tag();
                  $this.controls_.push(tag);
                  id = cntrl.attr('id');
                  if(!id){
                    id  = cntrl;
                  }
                  $this.control_.append(
                    tag.build(id, null, model, state, $this, i)
                  );
                  i++;
              });
            }
          }

          // return control
          // jQuery object
          return this.control_;
        }
    };


    /**
     * Register cm global object.
     */
    window.cm = window.cm || controlManager;

 }(jQuery);
