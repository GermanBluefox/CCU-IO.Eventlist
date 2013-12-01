/**
 *      CCU.IO-Eventlist
 *
 *      shows CCU.IO Logs as a Table
 *
 *      Copyright (c) 2013 Bluefox https://github.com/GermanBluefox
 *
 *      Lizenz: CC BY-NC 3.0 http://creativecommons.org/licenses/by-nc/3.0/legalcode
 *
 *      THE WORK (AS DEFINED BELOW) IS PROVIDED UNDER THE TERMS OF THIS CREATIVE COMMONS PUBLIC LICENSE ("CCPL" OR "LICENSE").
 *      THE WORK IS PROTECTED BY COPYRIGHT AND/OR OTHER APPLICABLE LAW. ANY USE OF THE WORK OTHER THAN AS AUTHORIZED UNDER
 *      THIS LICENSE OR COPYRIGHT LAW IS PROHIBITED.
 *
 *      BY EXERCISING ANY RIGHTS TO THE WORK PROVIDED HERE, YOU ACCEPT AND AGREE TO BE BOUND BY THE TERMS OF THIS LICENSE.
 *      TO THE EXTENT THIS LICENSE MAY BE CONSIDERED TO BE A CONTRACT, THE LICENSOR GRANTS YOU THE RIGHTS CONTAINED HERE
 *      IN CONSIDERATION OF YOUR ACCEPTANCE OF SUCH TERMS AND CONDITIONS.
 *
 *      Parameters:
 *      - loading  - Show loading process
 *      - advanced - Show events as text, like "Lamp in the kitchen is on"
 *      - lang     - Language
 *      - hmID     - Show only events for eventlist Homematic ID
 *      - states   - Show only state changes. Do not show temperature, humidity, all cyclic values
 *      - types    - Show "a"ll, Show only "v"ariables, show Only "d"evices
 *      - width    - Width of window
 *      - pcount   - Number of items on one page at start. Can be: 25,50,100,250,500,750,1000
 *      - value    - Show only events with this value
 *      - compact  - Show only time if value is filtered, if no value filter, so show value too
 *      - true     - Replace true with this value
 *      - false    - Replace false with this value
 */

var eventlist;

(function ($) {

    eventlist = {
        settings:   {
            loading:     true,   // Show loading status
            advanced:    false,  // Show events as text
            lang:        'de',
            hmID:        null,
            onlyStates:  true,   // Filter out humidity, temperature and so on
            showTypes:   0,      // 0 - all, 1 - devices, 2 - variables
            width:       0,      // Width of table: 0 is 100%
            itemsOnPage: 250,    // Number of events in one page
			value:       null,   // Filter for values (null: filter is OFF)
			compact:     false,  // Show only time if value is filtered, if no value filter, so show value too
			vtrue:       null,   // Replace true with this value
			vfalse:      null    // Replace false with this value
        },
        version:     "0.0.9",
        requiredCcuIoVersion: "0.9.62",
        socket:      null,
        regaObjects: null,
        regaIndex:   null,
        stringTable: null,
        logData:     [],
        jHtml:       null,   // jquery container object 
        count:       0,
        todayFile:   "devices-variables.log",
        active:      0,  // Active day
        newEvents:   -1,
        state:       [],
        queryParams: null,
        today:       null,
        isHideHeader: false,
		textNoEntries: null,


        show: function () {
            if (document.getElementById("#histTable" + eventlist.count) == null) {
                var txt  = "<table id='histTable" + eventlist.count + "'></table>";
                txt += "<div id='histPager" + eventlist.count + "'></div>";
                eventlist.jHtml.html(txt);
            }

            var rooms = {"": eventlist.translate("All")};
            rooms["System"] = eventlist.translate("System");
            // Create rooms dropdown 
            for (var i = 0; i < eventlist.regaIndex['ENUM_ROOMS'].length; i++) {
                rooms[eventlist.regaObjects[eventlist.regaIndex['ENUM_ROOMS'][i]]['Name']] = eventlist.regaObjects[eventlist.regaIndex['ENUM_ROOMS'][i]]['Name'];
            }

            var funcs = {"": eventlist.translate("All")};
            // Create functions dropdown 
            for (var i = 0; i < eventlist.regaIndex['ENUM_FUNCTIONS'].length; i++) {
                funcs[eventlist.regaObjects[eventlist.regaIndex['ENUM_FUNCTIONS'][i]]['Name']] = eventlist.regaObjects[eventlist.regaIndex['ENUM_FUNCTIONS'][i]]['Name'];
            }

            var colNames;
            var colModel;
            eventlist.isHideHeader = false;
            if (eventlist.settings.compact) {
                // Show time and value
                if (eventlist.settings.value == null) {
                    colNames = ['Id', eventlist.translate ('Time'), eventlist.translate ('Value')];
                    colModel = [
                        {name:'id',       index:'id',        width:1,   sorttype: 'int', hidden:true, key:true},
                        {name:'Time',     index:'Time',      width:50,  sortable:false},
 						{name:'Value',    index:'Value',     width:(eventlist.settings.vtrue == null) ? 100: 50, sorttype: 'text', search: false}
                   ];
                }
                // Show only time
                else {
                    eventlist.isHideHeader = true;
                    colNames = ['Id', eventlist.translate ('Time')];
                    colModel = [
                        {name:'id',       index:'id',        width:1,   sorttype: 'int', hidden:true, key:true},
                        {name:'Time',     index:'Time',      width:50,  align: 'center', sortable:false},
                    ];
                }
            }
            else
            if (eventlist.settings.advanced) {
                colNames = ['Id', eventlist.translate ('Time'), eventlist.translate ('Room'), '', eventlist.translate ('Description'), eventlist.translate ('Type')];
                colModel = [
                    {name:'id',       index:'id',        width:1,   sorttype: 'int', hidden:true, key:true},
                    {name:'Time',     index:'Time',      width:50,  sortable:false},
                    {name:'Room',     index:'Room',      width:100, sortable:false,  align:"right",  stype: 'select'},
                    {name:'Image',    index:'Image',     width:22,  sortable:false,  align:"center", search: false},
                    {name:'Action',   index:'Action',    width:400, sortable:false, search: false},
                    {name:'Type',     index:'Type',      width:100, sortable:false}
                ];
            }
            else {
                colNames = ['Id', eventlist.translate ('Time'), eventlist.translate ('Room'), eventlist.translate ('Function'), '', eventlist.translate ('Name'), eventlist.translate ('Type'), eventlist.translate ('Value')];
                colModel = [
                    {name:'id',       index:'id',        width:1,   sorttype: 'int', hidden:true, key:true},
                    {name:'Time',     index:'Time',      width:50,  sortable:false},
                    {name:'Room',     index:'Room',      width:100, sorttype: 'text',align:"right",  stype: 'select', editoptions: { value: rooms }, searchoptions:{value:rooms, sopt:['cn']}},
                    {name:'Function', index:'Function',  width:100, sorttype: 'text',align:"right",  stype: 'select', editoptions: { value: funcs }, searchoptions:{value:funcs, sopt:['cn']}},
                    {name:'Image',    index:'Image',     width:22,  sortable:false,  align:"center", search: false},
                    {name:'Name',     index:'Name',      width:250, sorttype: 'text'},
                    {name:'Type',     index:'Type',      width:100, sortable:false},
                    {name:'Value',    index:'Value',     width:100, sorttype: 'text', search: false}
                ];
            }
            if (eventlist.logData[eventlist.active].data.length == 0) {
                eventlist.logData[eventlist.active].data[0] = {
                    "id":     1,
                    "Time":   eventlist.textNoEntries,
                    "Room":   "",
                    "Function":"",
                    "Image": "",
                    "Name":   eventlist.textNoEntries,
                    "Type":   "",
                    "Value":  ""
                };
            }


            // Create the grid
            var histTable = $("#histTable" + eventlist.count).jqGrid({
                datatype:    "local",
                data:        eventlist.logData[eventlist.active].data,
                height:      eventlist.jHtml.height() - (eventlist.isHideHeader ? 25 : (eventlist.settings.compact ? 50: 75)),
                autowidth:   true,
                shrinkToFit: true,
                scrollOffset :50,
                rowNum       :eventlist.settings.itemsOnPage,
                pgbuttons: true,
                colNames:colNames,
                colModel:colModel,
                sortname: 'id',
                multiselect: false,
                multiplesearch: true,
                search : true,
                pager: '#histPager' + eventlist.count,
                viewrecords: !eventlist.settings.compact,
                rowList:[25,50,100,250,500,750,1000],
                gridComplete: function(){
                    var grid = $("#histTable" + eventlist.count);
                    var data = grid.jqGrid("getGridParam", "postData");

                    if ((data.searchField == "Type"))
                        $('#jqgh_histTable' + eventlist.count + "_Type").html(data.searchString);
                    else
                        $('#jqgh_histTable' + eventlist.count + "_Type").html(eventlist.translate ('Type'));

                    if ((data.searchField == "Room"))
                        $('#jqgh_histTable' + eventlist.count + "_Room").html(data.searchString);
                    else
                        $('#jqgh_histTable' + eventlist.count + "_Room").html(eventlist.translate ('Room'));

                    if (eventlist.settings.advanced) {
                        if ((data.searchField == "Name"))
                            $('#jqgh_histTable' + eventlist.count + "_Action").html(data.searchString);
                        else
                            $('#jqgh_histTable' + eventlist.count + "_Action").html(eventlist.translate ('Description'));
                    }
                    else {
                        if ((data.searchField == "Name"))
                            $('#jqgh_histTable' + eventlist.count + "_Name").html(data.searchString);
                        else
                            $('#jqgh_histTable' + eventlist.count + "_Name").html(eventlist.translate ('Name'));
                    }
                }
            })
            if (!eventlist.settings.compact) {
                histTable.jqGrid('filterToolbar',{stringResult: true, searchOnEnter : false, defaultSearch: 'cn'});
            }
            if (eventlist.isHideHeader) {
                $(".ui-jqgrid-hdiv").hide();
            }

            // Add date selector
            var select = '<table style="border: 0px; border-spacing:0; padding: 0px; margin: 0px;"><tr style="border: 0px; border-spacing:0; padding: 0px; margin: 0px;"><td style="border: 0px; border-spacing:0; padding: 0px; margin: 0px;">\n';
            select += '&nbsp;<input type="text" id="histDate' + eventlist.count + '" style="width:60px"/>';
            select += "</td>\n";
            if (!eventlist.settings.compact) {
                select += '<td><select id="histType' + eventlist.count + '" onchange="eventlist.filterType()">\n';
                select += '<option value="a">'+eventlist.translate('All')+'</option>';
                select += '<option value="d">'+eventlist.translate('Only devices')+'</option>';
                select += '<option value="v">'+eventlist.translate('Only variables')+'</option>';
                select += '</select></td>';
            }
            select += "<td style='border: 0px; border-spacing:0; padding: 0px; margin: 0px;'>\n";
            select += '<div id="loader_small" style="vertical-align: left; text-align: center; z-index:500; position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; margin: 0 auto; ">\n';
            select += '    <span class="ajax-loader-small"></span>\n';
            select += '</div></td></tr>\n';
            select += '</table>';
            $('#histPager'+ eventlist.count + '_left').append (select);
            if (!eventlist.settings.compact) {
                // Select filter types
                document.getElementById ('histType'+ eventlist.count).options[eventlist.settings.showTypes].selected = true;
            }

            var d = new Date();
            var histDate = $('#histDate'+ eventlist.count);
            histDate.datepicker ().datepicker( "option", "dateFormat", 'dd.mm.yy').datepicker( "option", "maxDate", new Date(d.getFullYear(), d.getMonth(), d.getDate()));
            var dd = eventlist.logData[eventlist.logData.length-1].date;
            dd = dd.split('.');
            if (eventlist.today == null) {
                eventlist.today = $.datepicker.formatDate('dd.mm.yy', new Date());
            }

            histDate.datepicker( "option", "minDate", new Date(parseInt(dd[2]), parseInt(dd[1]) - 1, parseInt(dd[0])));

            histDate.val(eventlist.logData[eventlist.active].date);

            //document.getElementById ('histDate'+ eventlist.count).options[eventlist.active].selected = true;

            histDate.change (function () {
                var grid = $("#histTable" + eventlist.count);
                eventlist.settings.itemsOnPage = parseInt (grid.getGridParam('rowNum'));

                var date = $('#histDate'+ eventlist.count).val();
                if (date == eventlist.today)
                    date = eventlist.translate ("Today");

                for (var i = 0; i < eventlist.logData.length; i++) {
                    if (eventlist.logData[i].date == date) {
                        eventlist.active = i;
                        $('#loader_small').show ();
                        //$(window).resize (null);
                        eventlist.loadLog (eventlist.active);
                        eventlist.newEvents = -1;
                        break;
                    }
                }
            });
            $('#loader_small').hide ();
            $(window).resize (function () {
                $("#histTable" + eventlist.count).
                    setGridWidth  (eventlist.jHtml.width()).
                    setGridHeight (eventlist.jHtml.height() - (eventlist.isHideHeader ? 25 : (eventlist.settings.compact ? 50: 75)));
            });

        },
        _getImage: function (type) {
            if (eventlist.images == null) {
                eventlist.deviceImgPath = '/dashui/img/devices/50/';
                // Devices -> Images
                eventlist.images =  {
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
                    'HM-WS550STH-O':     'TH_CS_thumb.png',
					'HM-Sen-Wa-Od':      '82_hm-sen-wa-od_thumb.png',
					'HM-PB-6-WM55':      '86_hm-pb-6-wm55_thumb.png',
					'HM-RC-4-2':         '84_hm-rc-4-2_thumb.png',
					'HM-WDS30-OT2-SM':   'IP65_G201_thumb.png',
					'HM-RC-19-SW':       '20_hm-rc-19_thumb.png'
                };
            }
            if (eventlist.images[type])
                return eventlist.deviceImgPath + eventlist.images[type];
            else
                return "";
        }, // Get image for type
        getObjDesc: function (id) {
            var obj = {name: "", type: "", parentType: "", room: "System", unit: "", func: ""};

            if (eventlist.regaObjects == null)
                return null;

            if (eventlist.regaObjects[id] !== undefined) {
                var parent = "";
                var p = eventlist.regaObjects[id]["Parent"];
                var n = eventlist.regaObjects[id]["Name"];
                var rooms = eventlist.regaIndex["ENUM_ROOMS"];
                var funcs = eventlist.regaIndex["ENUM_FUNCTIONS"];

                obj.unit = eventlist.regaObjects[id]["ValueUnit"];
                if (obj.unit == "100%" || obj.unit === undefined)
                    obj.unit = "";

                for (var room in rooms) {
                    var roomObj = eventlist.regaObjects[rooms[room]];
                    for (var k = 0; k < roomObj["Channels"].length; k++){
                        if (roomObj["Channels"][k] == p){
                            obj.room = roomObj["Name"];
                            break;
                        }
                    }
                }

                for (var func in funcs) {
                    var funcObj = eventlist.regaObjects[funcs[func]];
                    for (var k = 0; k < funcObj["Channels"].length; k++){
                        if (funcObj["Channels"][k] == p){
                            obj.func = funcObj["Name"];
                            break;
                        }
                    }
                }

                if (p !== undefined && eventlist.regaObjects[p]["DPs"] !== undefined) {
                    parent = eventlist.regaObjects[p]["Name"];
                    var t = n.lastIndexOf ('.');
                    if (t != -1)
                        n = n.substring (t + 1);
                    obj.type = n;
                    obj.parentType = eventlist.regaObjects[eventlist.regaObjects[p]['Parent']].HssType;
                }
                else if (eventlist.regaObjects[id]["TypeName"] !== undefined) {
                    if (eventlist.regaObjects[id]["TypeName"] == "VARDP") {
                        parent = eventlist.translate ("Variable") + " / ";
                        obj.type = eventlist.translate ("Variable");
                    }
                    else
                    if (eventlist.regaObjects[id]["TypeName"] == "PROGRAM") {
                        parent = eventlist.translate ("Program") + " / ";
                        obj.type = eventlist.translate ("Program");
                    }
                }
                else {
                    obj.type = n;
                }

                obj.name = parent;
            }
            else
            if (id == 41) {
                obj.type = eventlist.translate ("System");
                obj.name = eventlist.translate ("Service messages");
            }
            else
            if (id == 40) {
                obj.type = eventlist.translate ("System");
                obj.name = eventlist.translate ("Alarms");
            }

            return obj;
        },
        filterOut: function (hm_id, type, value) {
            if (eventlist.settings.onlyStates && /*type != "STATE"*/
                (type == 'BRIGHTNESS' ||
                    type == 'WORKING' ||
                    type == 'HUMIDITY' ||
                    type == 'TEMPERATURE' ||
                    type == 'UNREACH_CTR' ||
                    type == 'STICKY_UNREACH' ||
                    type == 'ADJUSTING_COMMAND' ||
                    type == 'ADJUSTING_DATA' ||
                    type == 'Variable' ||
                    type == 'DIRECTION' ||
                    type == 'INFO' ||
                    type == 'IP'))
                return true;

            if (eventlist.settings.hmID != null && eventlist.settings.hmID.length > 0) {
                var isFound = false;
                for (var i = 0; i < eventlist.settings.hmID.length; i++)
                    if (eventlist.settings.hmID[i] == hm_id) {
                        isFound = true;
                        break;
                    }
                if (!isFound)
                    return true;
            }
            if (eventlist.settings.value != null && eventlist.settings.value != value.toString())
                return true;


            // showTypes: 0 - all, 1 - devices, 2 - variables
            if (eventlist.settings.showTypes == 1 && type == "Variable")
                return true;
            else
                return (eventlist.settings.showTypes == 2 && type != "Variable");


        },
        filterBy: function(value, filterBy) {
            var grid = $("#histTable" + eventlist.count);
            var filter = $("#gs_"+filterBy);
            if (filter.val() != "") {
                filter.val("").trigger("change");
            }
            else {
                filter.val(value).trigger("change");
            }
            grid[0].triggerToolbar();
            //grid.filterToolbar({stringResult: true,searchOnEnter : false, defaultSearch: 'cn'});


            //grid.trigger("reloadGrid");
        },
        filterType: function() {
            var val = $("#histType" + eventlist.count).val();
            if (val == 'v')
                eventlist.settings.showTypes = 2;
            else if (val == 'd')
                eventlist.settings.showTypes = 1;
            else
                eventlist.settings.showTypes = 0;

            $('#loader_small').show ();
            //$(window).resize (null);
            eventlist.loadLog (eventlist.active);
            eventlist.newEvents = -1;
        },
        loadData: function (callback) {
            $("#loader_output2").prepend("<span class='ajax-loader'></span> lade ReGaHSS-Objekte");
            eventlist.socket.emit('getObjects', function(obj) {
                eventlist.regaObjects = obj;
                eventlist.ajaxDone();
                $("#loader_output2").prepend("<span class='ajax-loader'></span> lade ReGaHSS-Index");
                // Weiter gehts mit dem Laden des Index
                eventlist.socket.emit('getIndex', function(obj) {
                    eventlist.regaIndex = obj;

                    eventlist.ajaxDone();

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
            if (eventlist.regaObjects == null || eventlist.regaIndex == null)
                return null;

            var triple = event.split(" ", 3);
            var val = triple[2];
            if (triple[0].length == 0)
                return null;
            if (triple[0][0] == '"')
                triple[0] = triple[0].substring(1);

            if (triple[0] != "" && triple[0][0] >= '0' && triple[0][0] <= '9' && !isNaN(triple[0])) {  // timestamp in ms, dp,    value   
                // If value realy changed
                if (eventlist.state[triple[1]]      === undefined     ||
                    eventlist.state[triple[1]].type  == 'PRESS_SHORT' ||
                    eventlist.state[triple[1]].type  == 'PRESS_LONG'  ||
                    eventlist.state[triple[1]].value != val) {
                    if (eventlist.state[triple[1]] === undefined) {
                        eventlist.state[triple[1]] = {name: eventlist.getObjDesc (triple[1]), value: val};

                        // Filter out default states of lowbat and error
                        if (eventlist.onlyStates) {
                            if (eventlist.state[triple[1]].name.type == 'LOWBAT' && val == 'false')
                                return null;
                            if (eventlist.state[triple[1]].name.type == 'ERROR' && val == '0')
                                return null;
                        }
                    }
                    else
                        eventlist.state[triple[1]].value = val;

                    if (eventlist.filterOut (triple[1], eventlist.state[triple[1]].name.type, val))
                        return null;

                    if (eventlist.state[triple[1]].name.type == 'LEVEL') {
                        val = ((parseFloat(val) * 100).toFixed(1) + '%').replace('.', ',');
                    } else
                    if (eventlist.state[triple[1]].name.type == 'STATE') {
						if (eventlist.settings.vtrue != null && val == "true") {
							val = eventlist.settings.vtrue;
						} else
						if (eventlist.settings.vfalse != null && val == "false") {
							val = eventlist.settings.vfalse;
						}
                    }
                    if (eventlist.state[triple[1]].name.unit != "")
                        val += " " + eventlist.state[triple[1]].name.unit;

                    if (eventlist._clickFilter === undefined) eventlist._clickFilter = eventlist.translate ('Click to filter...');

                    if (eventlist.settings.advanced) {
                        var action = eventlist.getActionAndState (triple[1], eventlist.state[triple[1]].name.name, eventlist.state[triple[1]].name.parentType, eventlist.state[triple[1]].name.type, val);
                        return{
                            "id":     id,
                            "Time":   eventlist.tick2date (triple[0], 2),
                            "Room":   '<div onclick="eventlist.filterBy(\''+eventlist.state[triple[1]].name.room+'\', \'Room\')">'+eventlist.state[triple[1]].name.room+'</div>',
                            "Function":'<div onclick="eventlist.filterBy(\''+eventlist.state[triple[1]].name.func+'\', \'Function\')">'+eventlist.state[triple[1]].name.func+'</div>',
                            "Image":  '<div id="histName_'+id+'" title="'+eventlist._clickFilter+'" onclick="eventlist.filterBy(\''+eventlist.state[triple[1]].name.name+'\', \'Name\')"><img src="'+eventlist._getImage(eventlist.state[triple[1]].name.parentType)+'" width=22 height=22 border=0/></div>',
                            "Name":   eventlist.state[triple[1]].name.name,
                            "Action": (action._class != '') ? "<div class='"+action._class+"' >" + action.text  + "</div>" : action.text,
                            "Type":   '<div onclick="eventlist.filterBy(\''+eventlist.state[triple[1]].name.type+'\', \'Type\')">'+eventlist.state[triple[1]].name.type+'</div>',
                            "Value":  (action._class != '') ? "<div class='"+action._class+"' >" + action.value + "</div>" : action.value
                        };
                    }
                    else {
                        return{
                            "id":     id,
                            "Time":   eventlist.tick2date (triple[0], 2),
                            "Room":   '<div onclick="eventlist.filterBy(\''+eventlist.state[triple[1]].name.room+'\', \'Room\')">'+eventlist.state[triple[1]].name.room+'</div>',
                            "Function":'<div onclick="eventlist.filterBy(\''+eventlist.state[triple[1]].name.func+'\', \'Function\')">'+eventlist.state[triple[1]].name.func+'</div>',
                            "Image":  '<div id="histName_'+id+'" title="'+eventlist._clickFilter+'" onclick="eventlist.filterBy(\''+eventlist.state[triple[1]].name.name+'\', \'Name\')"><img src="'+eventlist._getImage(eventlist.state[triple[1]].name.parentType)+'" width=22 height=22 border=0/></div>',
                            "Name":   '<div id="histName_'+id+'" title="'+eventlist._clickFilter+'" onclick="eventlist.filterBy(\''+eventlist.state[triple[1]].name.name+'\', \'Name\')">'+eventlist.state[triple[1]].name.name+'</div>',
                            "Type":   '<div onclick="eventlist.filterBy(\''+eventlist.state[triple[1]].name.type+'\', \'Type\')">'+eventlist.state[triple[1]].name.type+'</div>',
                            "Value":  val
                        };
                    }
                }
            }

            return null;
        },
        loadLog: function (indexToLoad) {
            // Do not load old logs, but today reload always
            if (indexToLoad > 0 && eventlist.logData[indexToLoad].loaded == true) {
                eventlist.show();
            }

            $("#loader_output2").prepend("<span class='ajax-loader'></span> lade "+eventlist.logData[indexToLoad].file+" ");

            var log = eventlist.logData[indexToLoad].file;

            if (log.match(/log$/)) {
                log = log + "?" + (new Date().getTime());
            }

            $.ajax({
                type: "GET",
                url: '/log/'+log,
                success: function (data) {
                    eventlist.ajaxDone();
                    $("#loader_output2").prepend("<span class='ajax-loader'></span> verarbeite "+eventlist.logData[indexToLoad].file+" ");
                    var dataArr = data.split("\n");
                    var l   = dataArr.length;

                    var cnt = 0;
                    eventlist.state = [];
                    for (var i = l - 1; i >= 0; i--) {
                        var obj = eventlist.getEvent (dataArr[i], cnt + 1);
                        if (obj != null) {
                            eventlist.logData[eventlist.active].data[cnt++] = obj;
                        }
                    }
                    eventlist.logData[indexToLoad].loaded = true;
                    eventlist.ajaxDone();
                    eventlist.show();
                }
            });
        },
        ajaxDone: function () {
            $(".ajax-loader").removeClass("ajax-loader").addClass("ajax-check");
            $("#loader_output2").prepend("<br/>\n");
        },
        loadLogsList: function () {
            if (eventlist.logData.length > 0) {
                eventlist.show ();
                return;
            }
            $("#loader_output2").prepend("<span class='ajax-loader'></span> frage vorhandene Logs ab");

            // Get the list of old log files
            eventlist.socket.emit('readdir', "log", function (obj) {
                eventlist.ajaxDone();
                var l = eventlist.todayFile.length+1; // Store the file name length for optimization

                eventlist.logData[0] = {date: eventlist.translate("Today"), data: [], loaded: false, file: eventlist.todayFile};
                for (var i = obj.length - 1; i >= 0 ; i--) {
                    if (obj[i].match(/devices\-variables\.log\./)) {
                        var date = obj[i].substring (l);
                        var dates = date.split('-');
                        date = dates[2] + "." + dates[1] + "." + dates[0];
                        eventlist.logData[eventlist.logData.length] = {date: date, data: [], loaded: false, file: obj[i]};
                    }
                }
                eventlist.loadLog (eventlist.active);
            });
        },
        getActionAndState: function (hmid, name, deviceType, pointType, value) {
            var action = {text: name + " / "+ pointType + " = " + value, _class: '', value: value};

            if (eventlist.regaObjects[hmid] !== undefined) {
                var parent  = eventlist.regaObjects[hmid].Parent;
                var devType = eventlist.stringTable[eventlist.regaObjects[parent]["ChnLabel"]];
                if (devType !== undefined) {
                    var varType = devType[pointType];
                    if (varType !== undefined) {

                    }
                }
            }
            else  {
                var debug = 1;
            }


            if (pointType == 'LEVEL') {
                var isFull = (value == "100,0%");
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
                action.value  = eventlist.translateAlive(value);
                action.text   = name + " ist " + action.value;
            }
            else
            if (pointType == 'MOTION') {
                action.value  = eventlist.translateMotion(value);
                action._class = (value == "true") ? 'h-active-full' : '';
                action.text   = name + " hat " + action.value;
            }
            else
            if (pointType == 'LOWBAT') {
                action.value  = eventlist.translateLowbat(value);
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
            if (eventlist._alive === undefined) {
                eventlist._alive = [];
                eventlist._alive[0] = eventlist.translate ("Offline");
                eventlist._alive[1] = eventlist.translate ("Online");
            }

            if (state == "true")
                return eventlist._alive[1];
            else
                return eventlist._alive[0];
        },
        translateMotion: function (state) {
            if (eventlist._motion === undefined) {
                eventlist._motion = [];
                eventlist._motion[0] = eventlist.translate ("No motion");
                eventlist._motion[1] = eventlist.translate ("Motion");
            }

            if (state == "true")
                return eventlist._motion[1];
            else
                return eventlist._motion[0];
        },
        translateLowbat: function (state) {
            if (eventlist._lowbat === undefined) {
                eventlist._lowbat = [];
                eventlist._lowbat[0] = eventlist.translate ("no battery problem");
                eventlist._lowbat[1] = eventlist.translate ("battery problem");
            }

            if (state == "true")
                return eventlist._lowbat[1];
            else
                return eventlist._lowbat[0];
        },
        translate: function (text) {
            if (eventlist.words == null) {
                eventlist.words = {
                    "Online"    : {"de": "Online"},
                    "Offline"   : {"de": "Offline"},
                    "no battery problem"    : {"de": "kein Batterieproblem"},
                    "battery problem"   : {"de": "Batterieproblem"},
                    "Motion"    : {"de": "Bewegung"},
                    "No motion" : {"de": "keine Bewegung"},
                    "Today"     : {"de": "Heute"},
                    "Click to filter...": {"de": "Filtere nach dem Namen"},
                    "Time"      : {"de": "Zeit"},
                    "Type"      : {"de": "Typ"},
                    "Description":{ "de": "Beschreibung"},
                    "Value"     : {"de": "Wert"},
                    "Room"      : {"de": "Zimmer"},
                    "Function"  : {"de": "Gewerk"},
                    "All"       : {"de": "Alle"},
                    "Only devices": {"de": "Nur Ger&auml;te"},
                    "Only variables": {"de": "Nur Variablen"},
                    "No entries": {"de": "Keine Ereignisse"},
                    "opened"    : {"de": "auf"},
                    "closed"    : {"de": "zu"},
                    "online"    : {"de": "online"},
                    "offline"   : {"de": "offline"}
                };
            }
            if (eventlist.words[text]) {
                if (eventlist.words[text][eventlist.settings.lang])
                    return eventlist.words[text][eventlist.settings.lang];
                else
                if (eventlist.words[text]["en"])
                    return eventlist.words[text]["en"];
            }

            return text;
        },
        init: function (elemName, options, regaObjects, regaIndex, strtable) {
            eventlist.queryParams = eventlist.getUrlVars();
            eventlist.settings = $.extend (eventlist.settings, options);
			if (eventlist.textNoEntries == null){
				eventlist.textNoEntries = eventlist.translate ("No entries");
			}

            if (eventlist.queryParams['loading'] !== undefined) {
                eventlist.settings.loading = (eventlist.queryParams['loading'] == "true");
            }
            if (eventlist.queryParams['compact'] !== undefined) {
                eventlist.settings.compact = (eventlist.queryParams['compact'] == "true");
            }
            if (eventlist.queryParams['advanced'] !== undefined) {
                eventlist.settings.advanced = (eventlist.queryParams['advanced'] == "true");
            }
            if (eventlist.queryParams['hmid'] !== undefined) {
                eventlist.settings.hmID = eventlist.queryParams['hmid'].split(',');
            }
            if (eventlist.queryParams['lang'] !== undefined) {
                eventlist.settings.lang = (eventlist.queryParams['lang'] == "true");
            }
            if (eventlist.queryParams['states'] !== undefined) {
                eventlist.settings.onlyStates = (eventlist.queryParams['states'] == "true");
            }   
            if (eventlist.queryParams['true'] !== undefined) {
                eventlist.settings.vtrue = eventlist.translate(eventlist.queryParams['true']);
            }   
            if (eventlist.queryParams['false'] !== undefined) {
                eventlist.settings.vfalse = eventlist.translate(eventlist.queryParams['false']);
            }   
            if (eventlist.queryParams['width'] !== undefined) {
                eventlist.settings.width = parseInt(eventlist.queryParams['width']);
            }
            if (eventlist.queryParams['pcount'] !== undefined) {
                eventlist.settings.itemsOnPage = parseInt(eventlist.queryParams['pcount']);
            }
            if (eventlist.queryParams['types'] !== undefined) {
                if (eventlist.queryParams['types'] == 'v')
                    eventlist.settings.showTypes = 2;
                else
                if (eventlist.queryParams['types'] == 'd')
                    eventlist.settings.showTypes = 1;
            }
            if (eventlist.queryParams['value'] !== undefined) {
                eventlist.settings.value = eventlist.queryParams['value'];
            }

            eventlist.jHtml = $("#"+elemName);

            if (eventlist.settings.width !== null && eventlist.settings.width !== 0) {
                eventlist.jHtml.width(eventlist.settings.width);
            }

            if (eventlist.jHtml == null) {
                window.alert ("HTML element " + elemName + " does not exist");
                return;
            }

            // Create trace outputs
            var sInfoText = '';
            if (eventlist.settings.loading) {
                sInfoText += '<div id="loader" style="display:none">';
                sInfoText += '    <div id="loader_output">';
                sInfoText += '        <div id="loader_output2"></div>';
                sInfoText += '    </div>';
                sInfoText += '</div>';
            }
            sInfoText += '<div id="loader_small" style="vertical-align: middle; text-align: center; z-index:500; position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; margin: 0 auto; ">';
            sInfoText += '    <span class="ajax-loader-small"></span>';
            sInfoText += '</div>';

            eventlist.jHtml.append (sInfoText);

            $('#loader').show();

            // Verbindung zu CCU.IO herstellen.
            if (eventlist.socket == null) {
                eventlist.socket = io.connect( $(location).attr('protocol') + '//' +  $(location).attr('host')+"?key="+socketSession);

                eventlist.socket.emit('getSettings', function (ccuIoSettings) {
                    if (ccuIoSettings.version < eventlist.requiredCcuIoVersion) {
                        alert("Warning: requires CCU.IO version "+eventlist.requiredCcuIoVersion+" - found CCU.IO version "+ccuIoSettings.version+" - please update CCU.IO.");
                    }
                });

                // Von CCU.IO empfangene Events verarbeiten
                eventlist.socket.on('event', function(obj) {
                    if (eventlist.active == 0) {// If today
                        var d = Date.now();
                        // Add to the top
                        var obj_ = eventlist.getEvent (Math.floor(d / 1000) + " " + obj[0] + " " + obj[1], eventlist.newEvents);
                        if (obj_) {
                            var tt = $("#histTable" + eventlist.count);
							
							// Delete "no entries" text
							var empty = tt.jqGrid('getRowData', 1);
							if (empty && empty["Time"] == eventlist.textNoEntries) {
								tt.jqGrid('delRowData', 1);
							}
                            tt.jqGrid('addRowData', eventlist.newEvents, obj_, "first");
                            tt.jqGrid().trigger('reloadGrid');
                            eventlist.newEvents--;
                        }
                    }
                });
            }

            $(".eventlist-version").html(eventlist.version);

            eventlist.stringTable = strtable;

            if ((eventlist.regaObjects == null && regaObjects == undefined) ||
                (eventlist.regaIndex   == null && regaIndex   == undefined)) {
                eventlist.loadData (eventlist.loadLogsList);
            }
            else {
                eventlist.regaObjects = (eventlist.regaObjects != null) ? eventlist.regaObjects : regaObjects;
                eventlist.regaIndex   = (eventlist.regaIndex   != null) ? eventlist.regaIndex   : regaIndex;
                eventlist.loadLogsList ();
            }
        }
    };

})(jQuery);