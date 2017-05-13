/* ========================================================================
 * adpresso-ui framework
 * controls.js v1.0.0
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

 cm.div = function(cl){
   var c = $('<div/>');
   if(cl){
     c.addClass(cl);
   }
   return c;
 };

 cm.GroupControl = function(){
   cm.Control.call(this);
 };
 cm.inherits(cm.GroupControl, cm.Control);

 var groupControlPrototype = cm.GroupControl.prototype;

 groupControlPrototype.renderDom = function(){
   this.renderCon_();
   this.renderLabel_();
   this.renderControlCon_();

   if(this.state_ === 'view'){
     this.renderStatic_();
   } else {
     this.renderControl_();
   }
   this.built_ = true;
   this.control_ = this.assemble_();
 };

 groupControlPrototype.renderCon_ = function(){
   this.con_ = cm.div('form-group');
 };

 groupControlPrototype.renderLabel_ = function(){
   this.label_ = $('<label/>').addClass('control-label');
 };

 groupControlPrototype.renderControlCon_ = function(){
   this.contrCon_ = cm.div();
 };

 groupControlPrototype.assemble_ = function(){
   var $this = this,
       ctrl;
   $this.con_.append(this.label_);

   if($this.state_ === 'view'){
     ctrl = $this.static_
   } else {
     ctrl = $this.ctrl_;
   }
   $this.contrCon_.append(ctrl);

   if($this.attr_['ad-hide'] || $this.attr_['ad-hide'] === ''){
     $this.con_.hide();
   }
   $this.con_.append($this.contrCon_);

   return $this.con_;
 };

 /**
  * TextControl - class represents basic text control.
  *
  *
  */
 cm.TextControl = function(){
   cm.GroupControl.call(this);
 };
 cm.inherits(cm.TextControl, cm.GroupControl);

 var textControlPrototype = cm.TextControl.prototype;

 textControlPrototype.renderControl_ = function(base_tag){
   var $this = this,
       tag = '<input/>',
       attr = $this.attr_;
   if($this.state_ === 'view'){
     return;
   }
   if(base_tag){
     tag = base_tag;
   }
   $this.ctrl_ = $(tag)
     .attr('type','text')
     .attr('id', $this.id_)
     .addClass('form-control input-sm')
     .val($this.resolveValue_());

   if(attr['validate'] || attr['validate'] === ''){
     $this.label_.text('*' + attr['label']);
     $this.ctrl_.attr('data-val','true').attr('data-val-required', attr['label'] + 'is required.');
   } else {
     $this.label_.text(attr['label']);
   }
   if($this.lastRndr_){
     $this.lastRndr_.replaceWith($this.ctrl_);
   }
   $this.lastRndr_ = $this.ctrl_;
 };

 textControlPrototype.resolveValue_ = function(){
   var val = '';
   // First we get value out of the last rendered stae of the control...
   val = this.getLRVal_();
   // We assume that if there is a model for the control, it always override
   // any onther value assined or entered into control.
   if(this.state_ !== 'form' && this.model_ && this.model_[this.id_]){
     val = this.model_[this.id_];
   }
   if(this.state_ === 'form'){
     val = '';
   }
   return val;
 }

 textControlPrototype.renderStatic_ = function(){
   var $this = this;
   if($this.state_ === 'form' || $this.state_ === 'edit'){
     return;
   }
   $this.static_ = $('<p/>')
     .attr('id', $this.id_)
     .text($this.resolveValue_())
     .addClass('form-control-static');
   $this.label_.text($this.attr_['label']);
   if($this.lastRndr_){
     $this.lastRndr_.replaceWith($this.static_);
   }
   $this.lastRndr_ = $this.static_;
 };

 textControlPrototype.renderPartial_ = function(){
   this.renderStatic_();
   this.renderControl_();
 };

 // Retrieve Last rendered control value
 textControlPrototype.getLRVal_ = function(){
   var val = '',
       ctrl = this.lastRndr_;
   if(!ctrl){
     return val;
   }
   if(ctrl.prop("tagName") === 'P'){
     val = ctrl.text();
   } else {
     val = ctrl.val();
   }
   return val;
 };

 textControlPrototype.renderDom = function(){
   var $this = this,
       attr = $this.attr_,
       state = $this.state_,
       id = $this.id_,
       width = 6,
       widthAdj;

   if($this.built_){
     this.renderPartial_();
     return;
   }

   // Call base class' render method to render
   // grup...
   cm.TextControl.base(this, 'renderDom');

   // Setting few parameter on the group elements
   $this.con_.attr('id','con_' + id);
   $this.label_.attr('for', id);

   // Adding label column size
   if(attr['wlable']){
     widt = attr['wlable'];
   }
   $this.label_.addClass('col-md-' + width);

   width = 6;

   // Adding control column size
   if(attr['wcontrol']){
     width = attr['wcontrol'];
   }
   $this.contrCon_.addClass('col-md-' + width);
 };

 textControlPrototype.get = function(){
   return this.ctrl_.val();
 };

 textControlPrototype.set = function(value){
   this.ctrl_.val(value);
 };


 /**
  * TestAreaControl - class represents basic text area control.
  */
  cm.TextAreaControl = function(){
    cm.TextControl.call(this);
  };
  cm.inherits(cm.TextAreaControl, cm.TextControl);

  cm.TextAreaControl.prototype.renderControl_ = function(){
    cm.TextAreaControl.base(this, 'renderControl_', '<textarea/>');
    var h = "100";
    if(this.attr_['ad-height']){
      h = this.attr_['ad-height'];
    }
    this.ctrl_.css('height', h);
  };

  

 /**
  * Register controls.
  */
 cm.registerControl('ad-text', cm.TextControl);
 cm.registerControl('ad-textarea', cm.TextAreaControl);
