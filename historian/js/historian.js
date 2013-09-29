/**
 *      CCU.IO-Historian
 *
 *      visualisiert CCU.IO Logs als Tabelle
 *
 *      Copyright (c) 2013 Blueofx https://github.com/GermanBluefox
 *
 *      Lizenz: CC BY-NC 3.0 http://creativecommons.org/licenses/by-nc/3.0/de/
 *
 *      Die Veröffentlichung dieser Software erfolgt in der Hoffnung, daß sie Ihnen von Nutzen sein wird, aber
 *      OHNE IRGENDEINE GARANTIE, sogar ohne die implizite Garantie der MARKTREIFE oder der VERWENDBARKEIT FÜR EINEN
 *      BESTIMMTEN ZWECK.
 *
 */

;var historian;

(function ($) {

    historian = {
        version:     "0.0.1",
        socket:      null,
        regaObjects: null,
        regaIndex:   null,
        logData:     [],
        settings:    {},
        jHtml:       null,   // jquery container object 
        count:       0,
        todayFile:   "devices-variables.log",
        active:      0,  // Active day
        onlyStates:  true,
        lang:        'de',
        newEvents:   -1,
        state:       [],

        _getImage: function (type) {
            if (this.images == null) {
                this.deviceImgPath = '/dashui/img/devices/50/';
                // Devices -> Images
                this.images =  {
                    'HM-LC-Dim1TPBU-FM': 'PushButton-2ch-wm_thumb.png',
                    'HM-LC-Sw1PBU-FM':   'PushButton-2ch-wm_thumb.png',
                    'HM-LC-Bl1PBU-FM':   'PushButton-2ch-wm_thumb.png',
                    'HM-LC-Sw1-PB-FM':   'PushButton-2ch-wm_thumb.png',
                    'HM-PB-2-WM':        'PushButton-2ch-wm_thumb.png',
                    'HM-LC-Sw2-PB-FM':   'PushButton-4ch-wm_thumb.png',
                    'HM-PB-4-WM':        'PushButton-4ch-wm_thumb.png',
                    'HM-LC-Dim1L-Pl':    'OM55_DimmerSwitch_thumb.png',
                    'HM-LC-Dim1T-Pl':    'OM55_DimmerSwitch_thumb.png',
                    'HM-LC-Sw1-Pl':      'OM55_DimmerSwitch_thumb.png',
                    'HM-LC-Dim1L-Pl-2':  'OM55_DimmerSwitch_thumb.png',
                    'HM-LC-Sw1-Pl-OM54': 'OM55_DimmerSwitch_thumb.png',
                    'HM-Sys-sRP-Pl':     'OM55_DimmerSwitch_thumb.png',
                    'HM-LC-Dim1T-Pl-2':  'OM55_DimmerSwitch_thumb.png',
                    'HM-LC-Sw1-Pl-2':    'OM55_DimmerSwitch_thumb.png',
                    'HM-Sen-WA-OD':      '82_hm-sen-wa-od_thumb.png',
                    'HM-Dis-TD-T':       '81_hm-dis-td-t_thumb.png',
                    'HM-Sen-MDIR-O':     '80_hm-sen-mdir-o_thumb.png',
                    'HM-OU-LED16':       '78_hm-ou-led16_thumb.png',
                    'HM-LC-Sw1-Ba-PCB':  '77_hm-lc-sw1-ba-pcb_thumb.png',
                    'HM-LC-Sw4-WM':      '76_hm-lc-sw4-wm_thumb.png',
                    'HM-PB-2-WM55':      '75_hm-pb-2-wm55_thumb.png',
                    'atent':             '73_hm-atent_thumb.png',
                    'HM-RC-BRC-H':       '72_hm-rc-brc-h_thumb.png',
                    'HMW-IO-12-Sw14-DR': '71_hmw-io-12-sw14-dr_thumb.png',
                    'HM-PB-4Dis-WM':     '70_hm-pb-4dis-wm_thumb.png',
                    'HM-LC-Sw2-DR':      '69_hm-lc-sw2-dr_thumb.png',
                    'HM-LC-Sw4-DR':      '68_hm-lc-sw4-dr_thumb.png',
                    'HM-SCI-3-FM':       '67_hm-sci-3-fm_thumb.png',
                    'HM-LC-Dim1T-CV':    '66_hm-lc-dim1t-cv_thumb.png',
                    'HM-LC-Dim1T-FM':    '65_hm-lc-dim1t-fm_thumb.png',
                    'HM-LC-Dim2T-SM':    '64_hm-lc-dim2T-sm_thumb.png',
                    'HM-LC-Bl1-pb-FM':   '61_hm-lc-bl1-pb-fm_thumb.png',
                    'HM-LC-Bi1-pb-FM':   '61_hm-lc-bi1-pb-fm_thumb.png',
                    'HM-OU-CF-Pl':       '60_hm-ou-cf-pl_thumb.png',
                    'HM-OU-CFM-Pl':      '60_hm-ou-cf-pl_thumb.png',
                    'HMW-IO-12-FM':      '59_hmw-io-12-fm_thumb.png',
                    'HMW-Sen-SC-12-FM':  '58_hmw-sen-sc-12-fm_thumb.png',
                    'HM-CC-SCD':         '57_hm-cc-scd_thumb.png',
                    'HMW-Sen-SC-12-DR':  '56_hmw-sen-sc-12-dr_thumb.png',
                    'HM-Sec-SFA-SM':     '55_hm-sec-sfa-sm_thumb.png',
                    'HM-LC-ddc1':        '54a_lc-ddc1_thumb.png',
                    'HM-LC-ddc1-PCB':    '54_hm-lc-ddc1-pcb_thumb.png',
                    'HM-Sen-MDIR-SM':    '53_hm-sen-mdir-sm_thumb.png',
                    'HM-Sec-SD-Team':    '52_hm-sec-sd-team_thumb.png',
                    'HM-Sec-SD':         '51_hm-sec-sd_thumb.png',
                    'HM-Sec-MDIR':       '50_hm-sec-mdir_thumb.png',
                    'HM-Sec-WDS':        '49_hm-sec-wds_thumb.png',
                    'HM-Sen-EP':         '48_hm-sen-ep_thumb.png',
                    'HM-Sec-TiS':        '47_hm-sec-tis_thumb.png',
                    'HM-LC-Sw4-PCB':     '46_hm-lc-sw4-pcb_thumb.png',
                    'HM-LC-Dim2L-SM':    '45_hm-lc-dim2l-sm_thumb.png',
                    'HM-EM-CCM':         '44_hm-em-ccm_thumb.png',
                    'HM-CC-VD':          '43_hm-cc-vd_thumb.png',
                    'HM-CC-TC':          '42_hm-cc-tc_thumb.png',
                    'HM-Swi-3-FM':       '39_hm-swi-3-fm_thumb.png',
                    'HM-PBI-4-FM':       '38_hm-pbi-4-fm_thumb.png',
                    'HMW-Sys-PS7-DR':    '36_hmw-sys-ps7-dr_thumb.png',
                    'HMW-Sys-TM-DR':     '35_hmw-sys-tm-dr_thumb.png',
                    'HMW-Sys-TM':        '34_hmw-sys-tm_thumb.png',
                    'HMW-Sec-TR-FM':     '33_hmw-sec-tr-fm_thumb.png',
                    'HMW-WSTH-SM':       '32_hmw-wsth-sm_thumb.png',
                    'HMW-WSE-SM':        '31_hmw-wse-sm_thumb.png',
                    'HMW-IO-12-Sw7-DR':  '30_hmw-io-12-sw7-dr_thumb.png',
                    'HMW-IO-4-FM':       '29_hmw-io-4-fm_thumb.png',
                    'HMW-LC-Dim1L-DR':   '28_hmw-lc-dim1l-dr_thumb.png',
                    'HMW-LC-Bl1-DR':     '27_hmw-lc-bl1-dr_thumb.png',
                    'HMW-LC-Sw2-DR':     '26_hmw-lc-sw2-dr_thumb.png',
                    'HM-EM-CMM':         '25_hm-em-cmm_thumb.png',
                    'HM-CCU-1':          '24_hm-cen-3-1_thumb.png',
                    'HM-RCV-50':         '24_hm-cen-3-1_thumb.png',
                    'HMW-RCV-50':        '24_hm-cen-3-1_thumb.png',
                    'HM-RC-Key3':        '23_hm-rc-key3-b_thumb.png',
                    'HM-RC-Key3-B':      '23_hm-rc-key3-b_thumb.png',
                    'HM-RC-Sec3':        '22_hm-rc-sec3-b_thumb.png',
                    'HM-RC-Sec3-B':      '22_hm-rc-sec3-b_thumb.png',
                    'HM-RC-P1':          '21_hm-rc-p1_thumb.png',
                    'HM-RC-19':          '20_hm-rc-19_thumb.png',
                    'HM-RC-19-B':        '20_hm-rc-19_thumb.png',
                    'HM-RC-12':          '19_hm-rc-12_thumb.png',
                    'HM-RC-12-B':        '19_hm-rc-12_thumb.png',
                    'HM-RC-4':           '18_hm-rc-4_thumb.png',
                    'HM-RC-4-B':         '18_hm-rc-4_thumb.png',
                    'HM-Sec-RHS':        '17_hm-sec-rhs_thumb.png',
                    'HM-Sec-SC':         '16_hm-sec-sc_thumb.png',
                    'HM-Sec-Win':        '15_hm-sec-win_thumb.png',
                    'HM-Sec-Key':        '14_hm-sec-key_thumb.png',
                    'HM-Sec-Key-S':      '14_hm-sec-key_thumb.png',
                    'HM-WS550STH-I':     '13_hm-ws550sth-i_thumb.png',
                    'HM-WDS40-TH-I':     '13_hm-ws550sth-i_thumb.png',
                    'HM-WS550-US':       '9_hm-ws550-us_thumb.png',
                    'WS550':             '9_hm-ws550-us_thumb.png',
                    'HM-WDC7000':        '9_hm-ws550-us_thumb.png',
                    'HM-LC-Sw1-SM':      '8_hm-lc-sw1-sm_thumb.png',
                    'HM-LC-Bl1-FM':      '7_hm-lc-bl1-fm_thumb.png',
                    'HM-LC-Bl1-SM':      '6_hm-lc-bl1-sm_thumb.png',
                    'HM-LC-Sw2-FM':      '5_hm-lc-sw2-fm_thumb.png',
                    'HM-LC-Sw1-FM':      '4_hm-lc-sw1-fm_thumb.png',
                    'HM-LC-Sw4-SM':      '3_hm-lc-sw4-sm_thumb.png',
                    'HM-LC-Dim1L-CV':    '2_hm-lc-dim1l-cv_thumb.png',
                    'HM-LC-Dim1PWM-CV':  '2_hm-lc-dim1l-cv_thumb.png',
                    'HM-WS550ST-IO':     'IP65_G201_thumb.png',
                    'HM-WDS30-T-O':      'IP65_G201_thumb.png',
                    'HM-WDS100-C6-O':    'WeatherCombiSensor_thumb.png',
                    'HM-WDS10-TH-O':     'TH_CS_thumb.png',
                    'HM-WS550STH-O':     'TH_CS_thumb.png'
                };	
            }
            if (this.images[type])
                return this.deviceImgPath + this.images[type];
            else
                return "";
        }, // Get image for type

        getObjDesc: function (id) {
            var obj = {name: "", type: "", parentType: "", room: "System"};
            
            if (historian.regaObjects == null)
                return null;
            
            if (historian.regaObjects[id] !== undefined) {
                var parent = "";
                var p = historian.regaObjects[id]["Parent"];
                var n = historian.regaObjects[id]["Name"];
                var rooms = historian.regaIndex["ENUM_ROOMS"];

                for (var room in rooms) {
                    for (var k = 0; k < historian.regaObjects[rooms[room]]["Channels"].length; k++){
                        if (historian.regaObjects[rooms[room]]["Channels"][k] == p){
                            obj.room = historian.regaObjects[rooms[room]]["Name"];
                            break;
                        }
                    } 
                }                        
                
                if (p !== undefined && historian.regaObjects[p]["DPs"] !== undefined) {
                    parent = historian.regaObjects[p]["Name"];
                    var t = n.lastIndexOf ('.');
                    if (t != -1)
                        n = n.substring (t + 1);                
                    obj.type = n;
                    obj.parentType = historian.regaObjects[historian.regaObjects[p]['Parent']].HssType;
                }
                else if (historian.regaObjects[id]["TypeName"] !== undefined) {
                    if (historian.regaObjects[id]["TypeName"] == "VARDP") {  
                        parent = historian.translate ("Variable") + " / ";
                        obj.type = historian.translate ("Variable");
                    }
                    else
                    if (historian.regaObjects[id]["TypeName"] == "PROGRAM") {  
                        parent = historian.translate ("Program") + " / ";
                        obj.type = historian.translate ("Program");
                    }
                }
                else {
                    obj.type = n;
                }
                
                obj.name = parent;
            }
            else 
            if (id == 41) {
                obj.type = historian.translate ("System");
                obj.name = historian.translate ("Service messages");
            }
            else
            if (id == 40) {
                obj.type = historian.translate ("System");
                obj.name = historian.translate ("Alarms");
            }

            return obj;
        },     
        filterOut: function (hm_id, type) {
            if (historian.onlyStates && /*type != "STATE"*/ 
                (type == 'BRIGHTNESS' || 
                 type == 'WORKING' || 
                 type == 'HUMIDITY' || 
                 type == 'TEMPERATURE' || 
                 type == 'UNREACH_CTR' || 
                 type == 'STICKY_UNREACH'|| 
                 type == 'ADJUSTING_COMMAND'|| 
                 type == 'ADJUSTING_DATA'|| 
                 type == 'Variable'|| 
                 type == 'DIRECTION'|| 
                 type == 'INFO'|| 
                 type == 'IP'))
                return true;
            else
                return false;
            
        },
        show: function () {
            if (document.getElementById("#histTable" + historian.count) == null) {
                var txt  = "<table id='histTable" + historian.count + "'></table>";
                    txt += "<div id='histPager" + historian.count + "'></div>";
                historian.jHtml.html(txt);
            }
            
            // Create the grid
            $("#histTable" + historian.count).jqGrid({
                datatype:    "local",
                data:        historian.logData[historian.active].data,
                height:      historian.jHtml.height() - 90,
                autowidth:   true,
                //shrinkToFit: true,
                scrollOffset :50,
                rowNum       :700,
                pgbuttons: true,
                colNames:['Id', historian.translate ('Time'), historian.translate ('Room'), '', historian.translate ('Description'), historian.translate ('Type')],
                colModel:[
                    {name:'id',       index:'id',        width:1,   sorttype: 'int', hidden:true, key:true},
                    {name:'Time',     index:'Time',      width:50,  sorttype: 'text', search: false},
                    {name:'Room',     index:'Room',      width:100, sortable:false,  align:"right", search: false},
                    {name:'Image',    index:'Image',     width:22,  sortable:false,  align:"center", search: false},
//                    {name:'Name',     index:'Name',      width:250, sorttype: 'text'},
                    {name:'Action',   index:'Action',    width:400, sorttype: 'text', search: false},
                    {name:'Type',     index:'Type',      width:100, sorttype: 'text'},
//                    {name:'Value',    index:'Value',     width:100, sorttype: 'text', search: false},
                ],
                sortname: 'id',
                multiselect: false,
                //multiplesearch: true,
                search : true,
                pager: '#histPager' + historian.count,
                viewrecords: true,
                gridComplete: function(){
                    var grid = $("#histTable" + historian.count);
                    var data = grid.jqGrid("getGridParam", "postData");
                    var ids = $("#histTable" + historian.count).jqGrid('getDataIDs');
                    var isType = (data.searchField == "Type");
                    var isRoom = (data.searchField == "Room");
                    var isName = (data.searchField == "Name");
                    /*
                    for (var i = 0; i < ids.length; i++) {
                        var btn = $('#histType_' + ids[i]);
                        btn.button();
                        if (isType) {
                            btn[0].checked = true;
                            btn.button("refresh");
                        }
                        var btn = $('#histRoom_' + ids[i]);
                        btn.button();
                        if (isRoom) {
                            btn[0].checked = true;
                            btn.button("refresh");
                        }                    
                    }*/
                    if (isType)
                        $('#jqgh_histTable' + historian.count + "_Type").html(data.searchString);
                    else
                         $('#jqgh_histTable' + historian.count + "_Type").html(historian.translate ('Type'))
                         
                    if (isRoom)
                        $('#jqgh_histTable' + historian.count + "_Room").html(data.searchString);
                    else
                         $('#jqgh_histTable' + historian.count + "_Room").html(historian.translate ('Room'));
                       
                    if (isName)
                        $('#jqgh_histTable' + historian.count + "_Action").html(data.searchString);
                    else
                         $('#jqgh_histTable' + historian.count + "_Action").html(historian.translate ('Description'));
                },
            });
            
            // Add date selector
            var select = '<table style="border: 0px; border-spacing:0; padding: 0px; margin: 0px;"><tr style="border: 0px; border-spacing:0; padding: 0px; margin: 0px;"><td style="border: 0px; border-spacing:0; padding: 0px; margin: 0px;"><select id="histDate' + historian.count + '">\n';
            for (var i = 0; i < historian.logData.length; i++) {
                select += "<option value='"+i+"'>" + historian.logData[i].date + "</option>\n";
            }
            select += "</select></td><td style='border: 0px; border-spacing:0; padding: 0px; margin: 0px;'>\n";
            select += '<div id="loader_small" style="vertical-align: left; text-align: center; z-index:500; position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; margin: 0 auto; ">\n';
            select += '    <span class="ajax-loader-small"></span>\n';
            select += '</div></td></tr>\n';
            select += '</table>';
            $('#histPager'+ historian.count + '_left').append (select);            
            document.getElementById ('histDate'+ historian.count).options[historian.active].selected = true;
            $('#histDate'+ historian.count).change (function () {
                historian.active = document.getElementById ('histDate'+ historian.count).selectedIndex;
                $('#loader_small').show ();
                $(window).resize (null);
                historian.loadLog (historian.active);
                historian.newEvents = -1;
            });
            $('#loader_small').hide ();
            $(window).resize (function () {
                $("#histTable" + historian.count).setGridWidth  (historian.jHtml.width());
                $("#histTable" + historian.count).setGridHeight (historian.jHtml.height() - 90);
            });
            
        },
        filterType: function(type) {     
            var grid = $("#histTable" + historian.count);
            var data = grid.jqGrid("getGridParam", "postData");

            if (data.searchField == "Type") {
                data.searchString = "";
                data.searchOper = "";
                data.searchField = "";
            }
            else {
                data.searchString = type;
                data.searchOper = "cn";
                data.searchField = "Type";
            }
            grid.jqGrid("setGridParam", { "postData": data });
            grid.trigger("reloadGrid");
        },
        filterName: function(name) {     
            var grid = $("#histTable" + historian.count);
            var data = grid.jqGrid("getGridParam", "postData");

            if (data.searchField == "Name") {
                data.searchString = "";
                data.searchOper = "";
                data.searchField = "";
            }
            else {
                data.searchString = name;
                data.searchOper = "cn";
                data.searchField = "Name";
            }
            grid.jqGrid("setGridParam", { "postData": data });
            grid.trigger("reloadGrid");
        },        
        filterRoom: function(room) {     
            var grid = $("#histTable" + historian.count);
            var data = grid.jqGrid("getGridParam", "postData");

            if (data.searchField == "Room") {
                data.searchString = "";
                data.searchOper = "";
                data.searchField = "";
            }
            else {
                data.searchString = room;
                data.searchOper = "cn";
                data.searchField = "Room";
            }
            grid.jqGrid("setGridParam", { "postData": data });
            grid.trigger("reloadGrid");
        },        
        loadData: function (callback) {
            $("#loader_output2").prepend("<span class='ajax-loader'></span> lade ReGaHSS-Objekte");
            historian.socket.emit('getObjects', function(obj) {
                historian.regaObjects = obj;
                historian.ajaxDone();
                $("#loader_output2").prepend("<span class='ajax-loader'></span> lade ReGaHSS-Index");
                // Weiter gehts mit dem Laden des Index
                historian.socket.emit('getIndex', function(obj) {
                    historian.regaIndex = obj;

                    historian.ajaxDone();
                    
                    if (callback) callback ();
                });
            });
        },
        getUrlVars: function () {
            var vars = {}, hash;
            if (window.location.href.indexOf('?') == -1) { return {}; }
            var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
            for(var i = 0; i < hashes.length; i++) {
                hash = hashes[i].split('=');
                if (hash[0] && hash[0] != "") {
                    vars[hash[0]] = hash[1];
                }
            }
            return vars;
        },
        tick2date: function (tickSeconds, type) { // type = undefined => date + time, type = 1 => date, type = 2 => time
            var d = new Date();
            d.setTime (tickSeconds*1000);
            
            var year, month, day;
            var hour, minute, second;
            
            if (type == 1 || !type) { // Date
                year   = d.getFullYear();
                month  = (d.getMonth() + 1).toString(10);
                month  = (month.length == 1 ? "0" + month : month);
                day    = d.getDate().toString(10);
                day    = (day.length == 1 ? "0" + day : day);
            }
            if (type == 2 || !type) { // Time
                hour   = d.getHours().toString(10);
                hour   = (hour.length == 1 ? "0" + hour : hour);
                minute = d.getMinutes().toString(10);
                minute = (minute.length == 1 ? "0" + minute : minute);
                second = d.getSeconds().toString(10);
                second = (second.length == 1 ? "0" + second : second);
            }
            
            if (type == 1) // Date
                return year + "." + month + "." + day;
            if (type == 2) // Time
                return hour + ":" + minute + ":" + second;
            else // together
                return year + "." + month + "." + day + " " + hour + ":" + minute + ":" + second;
        },
        getEvent: function (event, id) {
            if (historian.regaObjects == null || historian.regaIndex == null)
                return null;
        
            var triple = event.split(" ", 3);
            var k   = triple.length;
            var val = triple[2];
            if (triple[0].length == 0)
                return null;
            if (triple[0][0] == '"')
                triple[0] = triple[0].substring(1);
                
            if (triple[0] != "" && triple[0][0] >= '0' && triple[0][0] <= '9' && !isNaN(triple[0])) {  // timestamp in ms, dp,    value   
                // If value realy changed
                if (historian.state[triple[1]]      === undefined     || 
                    historian.state[triple[1]].type  == 'PRESS_SHORT' ||
                    historian.state[triple[1]].type  == 'PRESS_LONG'  ||
                    historian.state[triple[1]].value != val) {
                    if (historian.state[triple[1]] === undefined) {
                        historian.state[triple[1]] = {name: historian.getObjDesc (triple[1]), value: val};
                        
                        // Filter out default states of lowbat and error
                        if (historian.onlyStates) {
                            if (historian.state[triple[1]].name.type == 'LOWBAT' && val == 'false')
                                return null;
                            if (historian.state[triple[1]].name.type == 'ERROR' && val == '0')
                                return null;
                        }
                    }
                    else
                        historian.state[triple[1]].value = val;
                        
                    if (historian.filterOut (triple[1], historian.state[triple[1]].name.type))
                        return null;
                        
                    if (historian.state[triple[1]].name.type == 'LEVEL') {
                        val = ((parseFloat(val) * 100).toFixed(1) + '%').replace('.', ',');
                    }
                    
                    action = historian.getActionAndState (historian.state[triple[1]].name.name, historian.state[triple[1]].name.parentType, historian.state[triple[1]].name.type, val);

                    if (historian._clickFilter === undefined) historian._clickFilter = historian.translate ('Click to filter...');
                    
                    
                    return{
                            "id":     id,
                            "Time":   historian.tick2date (triple[0], 2),
                            "Room":   '<div onclick="historian.filterRoom(\''+historian.state[triple[1]].name.room+'\')">'+historian.state[triple[1]].name.room+'</div>',
                            "Image":  '<div id="histName_'+id+'" title="'+historian._clickFilter+'" onclick="historian.filterName(\''+historian.state[triple[1]].name.name+'\')"><img src="'+historian._getImage(historian.state[triple[1]].name.parentType)+'" width=22 height=22 border=0/></div>',
                            "Name":   historian.state[triple[1]].name.name,
                            "Action": (action._class != '') ? "<div class='"+action._class+"' >" + action.text  + "</div>" : action.text,
                            "Type":   '<div onclick="historian.filterType(\''+historian.state[triple[1]].name.type+'\')">'+historian.state[triple[1]].name.type+'</div>',
                            "Value":  (action._class != '') ? "<div class='"+action._class+"' >" + action.value + "</div>" : action.value,
                        };
                }
            }

            return null;            
        },
        
        loadLog: function (indexToLoad) {
            // Do not load old logs, but today reload always
            if (indexToLoad > 0 && historian.logData[indexToLoad].loaded == true) {
                historian.show();
            }

            $("#loader_output2").prepend("<span class='ajax-loader'></span> lade "+historian.logData[indexToLoad].file+" ");
            
            historian.socket.emit('readRawFile', 'log/'+historian.logData[indexToLoad].file, function (data) {
                historian.ajaxDone();
                $("#loader_output2").prepend("<span class='ajax-loader'></span> verarbeite "+historian.logData[indexToLoad].file+" ");
                var dataArr = data.split("\n");
                var l   = dataArr.length;
                
                var cnt = 0;
                historian.state = [];
                for (var i = l - 1; i >= 0; i--) {
                    var obj = historian.getEvent (dataArr[i], cnt + 1);
                    if (obj != null) {
                        historian.logData[historian.active].data[cnt++] = obj;
                    }
                }    
                historian.logData[indexToLoad].loaded = true;
                historian.ajaxDone();
                historian.show();
            });
        },
        ajaxDone: function () {
            $(".ajax-loader").removeClass("ajax-loader").addClass("ajax-check");
            $("#loader_output2").prepend("<br/>\n");
        },
        loadLogsList: function () {
            if (historian.logData.length > 0) {
                historian.show ();
                return;
            }
            $("#loader_output2").prepend("<span class='ajax-loader'></span> frage vorhandene Logs ab");

            // Get the list of old log files
            historian.socket.emit('readdir', "log", function (obj) {
                historian.ajaxDone();
                var l = historian.todayFile.length+1; // Store the file name length for optimization
                
                historian.logData[0] = {date: historian.translate("Today"), data: [], loaded: false, file: historian.todayFile};
                for (var i = obj.length - 1; i >= 0 ; i--) {
                    if (obj[i].match(/devices\-variables\.log\./)) {
                        historian.logData[historian.logData.length] = {date: obj[i].substring (l).replace('-','.').replace('-','.'), data: [], loaded: false, file: obj[i]};
                    }
                }
                historian.loadLog (historian.active);
            });
        },
        
        init: function (elemName, filterRooms, filterFunc, filterDP, rangeHours, regaObjects, regaIndex) {
            historian.queryParams = historian.getUrlVars();
        
            historian.jHtml = $("#"+elemName);
            historian.settings.filterRooms = filterRooms;
            historian.settings.filterFunc  = filterFunc;
            historian.settings.filterDP    = filterDP;
            var filesToRead = 100000; // read all data
            var d = new Date();
            var h = d.getHours() + 1;
            if (rangeHours === undefined) rangeHours = 0;
            if (rangeHours > 0) {
                if (rangeHours - h > 0) {
                    filesToRead = (rangeHours - h);
                    filesToRead = filesToRead / 24 + ((filesToRead % 24) ? 1 : 0);
                }
            }
            
            if (historian.settings.filesRead === undefined || 
                filesToRead > historian.settings.filesRead) {
                // Re/load all log data
                historian.settings.filesRead = filesToRead;
                historian.logData = [];
            }
            historian.settings.rangeHours  = rangeHours;
            
            if (historian.jHtml == null) {
                window.alert ("HTML element " + elemName + " does not exist");
                return;
            }
        
            // Create trace outputs
            var sInfoText = '';
            sInfoText += '<div id="loader" style="display:none">';
            sInfoText += '    <div id="loader_output">';
            sInfoText += '        <div id="loader_output2"></div>';
            sInfoText += '    </div>';
            sInfoText += '</div>';
            sInfoText += '<div id="loader_small" style="vertical-align: middle; text-align: center; z-index:500; position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; margin: 0 auto; ">';
            sInfoText += '    <span class="ajax-loader-small"></span>';
            sInfoText += '</div>';
            
            historian.jHtml.append (sInfoText);
        
            $('#loader').show();
        
            // Verbindung zu CCU.IO herstellen.
            if (historian.socket == null) {
                historian.socket = io.connect( $(location).attr('protocol') + '//' +  $(location).attr('host'));

                // Von CCU.IO empfangene Events verarbeiten
                historian.socket.on('event', function(obj) {
                    if (historian.active == 0) {// If today
                        var d = Date.now();
                        // Add to the top
                        var obj = historian.getEvent (Math.floor(d / 1000) + " " + obj[0] + " " + obj[1], historian.newEvents);
                        if (obj) {
                            $("#histTable" + historian.count).jqGrid('addRowData', historian.newEvents, obj, "first");
                            $("#histTable" + historian.count).jqGrid().trigger('reloadGrid');
                            historian.newEvents--;
                        }
                    }
                });
            }                
            
            $(".historian-version").html(historian.version);
            
            if ((historian.regaObjects == undefined && regaObjects == undefined) || 
                (historian.regaIndex   == undefined && regaIndex   == undefined)) {
                historian.loadData (historian.loadLogsList);
            }
            else
                historian.loadLogsList ();
        },
        getActionAndState: function (name, deviceType, pointType, value) {
            var action = {text: name + " / "+ pointType + " = " + value, _class: '', value: value};
            
            if (pointType == 'LEVEL') {
                var isFull = (value == "100,0%")
                action._class = isFull ? 'h-active-full' : '';
                if (isFull) 
                    action.text = name + " ist voll AUF";
                else if (value == "0,0%") 
                    action.text = name + " ist voll ZU";
                else
                    action.text = name + " ist auf " + action.value + " auf";
            }
            else
            if (pointType == 'ALIVE') {
                action._class = (value == "true") ? 'h-active-full' : '';
                action.value  = historian.translateAlive(value);
                action.text   = name + " ist " + action.value;
            }
            else
            if (pointType == 'MOTION') {
                action.value  = historian.translateMotion(value);
                action._class = (value == "true") ? 'h-active-full' : '';
                action.text   = name + " hat " + action.value;
            }
            else
            if (pointType == 'LOWBAT') {
                action.value  = historian.translateLowbat(value);
                if (value == "true") {
                    action._class = 'h-error-full';
                    action.text   = name + " hat Batterieproblem";
                }
                else {
                    action.text   = name + " hat kein Batterieproblem";
                }
            }
            else
            if (pointType == 'PRESS_LONG') {
                action.text  = name + "wurde <span class='h-lang'>lang</span> gedruckt";
                action.value = '';
            }            
            else
            if (pointType == 'PRESS_SHORT') {
                action.text  = name + " wurde kurz gedruckt";
                action.value = '';
            }            
            return action;
        },
        translateAlive: function (state) {
            if (historian._alive === undefined) {
                historian._alive = [];
                historian._alive[0] = historian.translate ("Offline");
                historian._alive[1] = historian.translate ("Online");
            }
        
            if (state == "true")
                return historian._alive[1];
            else
                return historian._alive[0];
        },        
        translateMotion: function (state) {
            if (historian._motion === undefined) {
                historian._motion = [];
                historian._motion[0] = historian.translate ("No motion");
                historian._motion[1] = historian.translate ("Motion");
            }
        
            if (state == "true")
                return historian._motion[1];
            else
                return historian._motion[0];
        },         
        translateLowbat: function (state) {
            if (historian._lowbat === undefined) {
                historian._lowbat = [];
                historian._lowbat[0] = historian.translate ("no battery problem");
                historian._lowbat[1] = historian.translate ("battery problem");
            }
        
            if (state == "true")
                return historian._lowbat[1];
            else
                return historian._lowbat[0];
        },         
        translate: function (text) {
            if (historian.words == null) {
                historian.words = {
                    "Online"    : {"en": "Online", "de": "Online"},
                    "Offline"   : {"en": "Online", "de": "Offline"},
                    "no battery problem"    : {"en": "no battery problem", "de": "kein Batterieproblem"},
                    "battery problem"   : {"en": "battery PROBLEM", "de": "Batterieproblem"},
                    "Motion"    : {"en": "Motion", "de": "Bewegung"},
                    "No motion" : {"en": "Online", "de": "keine Bewegung"},
                    "Today"     : {"en": "Today",  "de": "Heute"},
                    "Click to filter...": {"en": "Click to filter...",  "de": "Filtere nach dem Namen"},
                    "Type"      : {"en": "Type",  "de": "Typ"},
                    "Description": {"en": "Description",  "de": "Beschreibung"},
                    "Value"     : {"en": "Value",  "de": "Wert"},
                    "Room"      : {"en": "Room",   "de": "Zimmer"},
                };
            }
            if (historian.words[text]) {
                if (historian.words[text][historian.lang])
                    return historian.words[text][historian.lang];
                else 
                if (historian.words[text]["en"])
                    return historian.words[text]["en"];
            }

            return text;
        },
        queryParams: null,
    };

})(jQuery);
