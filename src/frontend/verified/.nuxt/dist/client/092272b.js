(window.webpackJsonp=window.webpackJsonp||[]).push([[7],{380:function(t,e,n){var content=n(422);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,n(64).default)("5dcd829e",content,!0,{sourceMap:!1})},421:function(t,e,n){"use strict";n(380)},422:function(t,e,n){var o=n(63)(!1);o.push([t.i,".center{display:flex;align-items:center;justify-content:center}",""]),t.exports=o},438:function(t,e,n){"use strict";n.r(e);var o=n(444),c=n(368),r=n(347),l=n(435),d=n(434),m=n(437),h=n(431),v=n(436),f=(n(30),{name:"PortalPage",data:function(){return{token:"",command:"",output:""}},methods:{exec:function(){var t=this;this.$axios.post("http://localhost/api/exec",{command:this.command},{headers:{Authorization:this.token}}).then((function(e){t.output=e.data}))}},mounted:function(){var t=localStorage.getItem("token");t?this.token=t:this.$router.push("/")}}),_=(n(421),n(76)),component=Object(_.a)(f,(function(){var t=this,e=t._self._c;return e(d.a,{attrs:{justify:"center",align:"center"}},[e(l.a,{attrs:{cols:"12",sm:"8",md:"6"}},[e(c.a,[e(r.c,{staticClass:"headline"},[t._v("\n                Welcome to verified.htb user portal\n            ")]),t._v(" "),e(r.b,[e("p",[t._v("\n                    You have successfully authenticated with your verifiable credential and you now have access to\n                    the verified.htb user portal\n                ")]),t._v(" "),e("p",[t._v("This portal allows you to execute commands in a jailed environment as the user defined in\n                    your credential")]),t._v(" "),e("p",[t._v("Simply enter the command you want to run and press the RUN button below")]),t._v(" "),e(h.a,{attrs:{clearable:"",label:"command"},model:{value:t.command,callback:function(e){t.command=e},expression:"command"}}),t._v(" "),t.output?e(v.a,{attrs:{label:"output",readonly:"",filled:"","auto-grow":"",value:t.output}}):t._e()],1),t._v(" "),e(r.a,[e(m.a),t._v(" "),e(o.a,{attrs:{color:"primary"},on:{click:t.exec}},[t._v(" RUN ")])],1)],1)],1)],1)}),[],!1,null,null,null);e.default=component.exports}}]);