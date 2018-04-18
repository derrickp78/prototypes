;$(document).ready(function () {
    "use strict";
    //jQuery to remove hover effect on schedules so they are touchscreen friendly.
    $(".event-positioner").click(function(event){
    	event.stopPropagation();
    	//$(this).find(".eventPopup-left, .eventPopup-right").show();
    	$(document).find(".eventPopup-left, .eventPopup-right").css("display", "none");
    	$(this).find(".eventPopup-left, .eventPopup-right").css("display", "inherit");
    });
    
    $(document).click( function(){
        //$('.eventPopup-left, .eventPopup-right').hide();
    	$('.eventPopup-left, .eventPopup-right').css("display", "none");
    });    
    
    $('#newCalendar').ready(function(){ 
    	
    	var getLocation = getRequestPath();
    	$('#newCalendar').fullCalendar({
    		// put your options and callbacks here
    		header:{
    			left: 'prev,next today',
    			center: 'title',
    			right: 'month,agendaWeek,agendaDay,listWeek'
    		},
    		eventSources:[
    			{
    					url: getLocation,
    					method : "POST",
    					dataType: "json",
    					data: {
    						'sa'	: 'MylSystem.volunteerSignupGetEvents',
    						'securityToken'	: ip.securityToken,
    					},
    					success: function(data){
    						console.log(data);
    					}
    			}
    		],
    		allDaySlot: false,
            navLinks: true, // can click day/week names to navigate views
            eventLimit: true, // allow "more" link when too many events
    	});    	  		   	
    });
    
    $('#stat-select').change( function(){
    	var id = $(this).val();
    	$("#leaderboard-body").children('div').each(function(){
    		$(this).hide();
    	});
    	$("#stat-" + id).show();
    });
    
    // test
    /**
     * @type : Menu
     * @info : The menu class handles varying link types.
     */
    function Menu() {

        /**
         * @var array pages
         */
        this.pages = {};

        /**
         * The query paramter to identify application links.
         * @var string
         */
        this.INAPP_QUERY = 'inApplication';

    }
    Menu.prototype = {

        /**
         * Adds listeners for the different types of link elements.
         */
        setupListeners : function() {

            var self = this;

            // listeners for clickable links
            $('body').on('click', '.popup-menu', function(e) {
                self.onClick(e, $(this), 'popup-menu');
            });
            $('body').on('click', '.swingdown-menu', function(e) {
                self.onClick(e, $(this), 'swingdown-menu');
            });
            $('body').on('click', '.admin-menu', function(e) {
                self.onClick(e, $(this), 'admin-menu');
            });

            // listener for on load functions
            $('.wrapper').find('[data-on-load]').each(function(element, value) {
                var action = $(this).attr('data-on-load');

                switch (action) {
                    case 'setupDialog':
                        self.cachePage(window.location.href, 'swingdown-menu', $(this));
                        self.makeDialog($(this));
                        break;
                    default:
                        console.log('Incorrect on load function specified.');
                }

            });

        },

        /**
         * Dialogs an element and returns a handle to it.
         * @param $target
         * @return jQuery object
         */
        makeDialog : function($target) {
            return $target.dialog({
                height : '700',
                width: 'auto',
                maxWidth : '400',
                hide : {
                    effect : 'clip',
                    duration : 200
                },
                show : {
                    effect : 'clip',
                    duration : 70
                },
                create : function(event, ui) {
                    $(this).css('maxWidth', '400px');
                },
                resizeStop : function(event, ui) {
                    $(this).css('width', '100%');
                    $(this).css('height', '700px');
                }
            }).uniqueId();
        },

        /**
         * Caches a page retrieved with ajax.
         * @param string link
         * @param string targetType
         * @param jQuery object $handle
         */
        cachePage : function(link, targetType, $handle) {

            this.pages[link] = {
                target : targetType,
                handle : $handle
            };
        },

        /**
         * Returns the page info if it is cached.
         * @param string link
         * @return NULL|object
         */
        getCached : function(link) {

            return typeof this.pages[link] !== 'undefined' ? this.pages[link] : null;
        },

        /**
         * Loads a page depending on the specified target type.
         * @param string link
         * @param targetType
         */
        loadPage : function(link, targetType) {

            switch(targetType) {

                case 'swingdown-menu':
                    this.openModal(link, targetType);
                    break;
                case 'admin-menu':
                    this.openAdmin(link);
                    break;
                case 'popup-menu':
                default:
                    this.openWindow(link);

            }

        },

        /**
         * Opens the specified page in a new window.
         * @param string link
         */
        openWindow : function(link) {
            window.open(link, 'SystemModule', 'width=500, height=500, resizable=yes');
        },

        /**
         * Opens the admin page in a new window.
         * @param string link
         */
        openAdmin : function(link) {
            window.open(link, '_blank', 'fullscreen=yes, resizable=yes, scrollbars=yes');
        },

        /**
         * Opens the specified page in a modal dialog.
         * @param string link
         * @param string targetType
         */
        openModal : function(link, targetType) {

            // check if we have the page cached
            var page = this.getCached(link);
            if(page) {
                page.handle.dialog('open');
                return;
            }

            // ajax load the page and cache it
            this.getData(link, targetType);
        },

        /**
         * Request the specified page and cache it (unless specified otherwise).
         * @param string link
         * @param string targetType
         * @param bool noCache {optional : defaults to false}
         */
        getData : function(link, targetType, noCache) {

            var self = this;

            // add an inApplication parameter so we can support modals
            var inAppLink = this.prependParam(link, this.INAPP_QUERY, 'true');

            // cache page unless told otherwise
            if(typeof noCache === 'undefined') {
                var noCache = false;
            }

            $.ajax({
                url: inAppLink,
                method: 'GET',
                context: document.body,
                success: function(res) {

                    $('.modal-wrapper').html(res);

                    // check for missing container
                    if($('#swingdown-dialog').length === 0) {
                        alert('There was an issue loading the requested menu.');
                        return;
                    }

                    // make the dialog
                    var $self = self.makeDialog($('#swingdown-dialog'));

                    // make sure forms are working
                    ipInitForms();

                    if(noCache) {
                        return;
                    }

                    self.cachePage(link, targetType, $self);
                }
            });
        },

        /**
         * Inserts a string into a base at a specified index.
         * @param string base
         * @param int index
         * @param string string
         * @return string : modified string
         */
        insertIntoString : function(base, index, string) {
            if (index > 0) {
                return base.substring(0, index) + string + base.substring(index, base.length);
            } else {
                return string + base;
            }
        },

        /**
         * Remove a parameter from a link.
         * @param string link
         * @param string key
         * @return string
         */
        removeParam : function(link, key) {
            // if there are no params in the link, we're done.
            var queryInd = link.indexOf('?');
            if(queryInd < 0) {
                return link;
            }

            // split off the query so we don't have problems with the key being in the rest.
            var urlPiece = link.substring(0, queryInd);
            var queryPiece = link.substring(urlPiece.length, link.length);

            // if the key isn't in the query string, we're done.
            var keyInd = queryPiece.indexOf(key);
            if(keyInd < 0) {
                return link;
            }

            var ampInd = queryPiece.indexOf('&');

            // find the end of the key's value.
            var endString = queryPiece.substring(keyInd+1, queryPiece.length);
            var endAmp = endString.indexOf('&');
            var endValue = -1;
            if(endAmp >= 0) {
                endValue = endAmp + keyInd + 1;
            } else {
                endValue = queryPiece.length;
            }

            // if our key-value pair is singular, or not first, remove the character before it and the key-value pair
            if(ampInd < 0 || ampInd < keyInd) {
                return urlPiece + queryPiece.substring(0, keyInd-1) + queryPiece.substring(endValue, queryPiece.length);

            // otherwise, remove only it and the following ampersand (since we want to preserve the '?')
            } else {
                return urlPiece + queryPiece.substring(0, keyInd) + queryPiece.substring(endValue+1, queryPiece.length);
            }

        },

        /**
         * Adds a parameter to a url.
         * @param string link
         * @param string key
         * @param string value
         * @return string
         */
        prependParam : function(link, key, value) {
            var ampInd = link.indexOf('&');
            var queryInd = link.indexOf('?');
            var anchorInd = link.indexOf('#');
            var paramString = key + '=' + value;

            // if we have params add ours first
            if(queryInd > -1 && link.length-1 != queryInd) {
                return this.insertIntoString(link, queryInd+1, paramString + '&');
            // if we have an anchor and no params, add ours before anchor
            } else if (anchorInd > -1 && queryInd < 0) {
                return this.insertIntoString(link, anchorInd, '?' + paramString);
            // if we have no anchors and no params and no query mark add it all
            } else if(link.length-1 != queryInd) {
                return link + '?' + paramString;
            // if we have a query mark add our param
            } else {
                return link + paramString;
            }
       },

        /**
         * Handles click events for menu links.
         * @param object e : event
         * @param jQuery object $scope : handle to the clicked object
         * @param string targetType
         */
        onClick : function(e, $scope, targetType) {
            e.preventDefault();
            var link = $scope.attr('href');

            if(!link) {
                link = $scope.find('a').attr('href');
            }
            if(!link) {
                return;
            }

            this.loadPage(link, targetType);
        }

    };
    var menu = new Menu();
    menu.setupListeners();
    // End Menu Section

    // end here if in admin editing mode
    if (ip.isManagementState) {

        // remove the skin handles from myl modules
        if($('.ipWidget-MylModules').length) {
            $('.ipWidget-MylModules').find('._settings').remove();
        }

        // reset the column width handles (updates their position if we have widgets extending the page height)
        if(typeof ipColumnsInitWidthHandles === 'function') {
            $('img').on('load', ipColumnsInitWidthHandles);
        }

        return;
    }

    /**
     * @type : Division
     * @info : Division is a static class.
     *          There should be exactly one division module on
     *          the page. All myl modules use its interface.
     */
    var Division = {

        /**
         * @var _divisions array
         */
        _divisions : [],

        /**
         * @var _modules array
         */
        _modules : [],

        /**
         * @var _modulesCount int
         */
        _modulesCount : 0,

        /**
         * @var isPausedDivision bool
         */
        _isPausedDivision : false,

        /**
         * @var _isPausedModules bool
         */
        _isPausedModules : false,

        /**
         * @var _isPerformingToggle bool
         */
        _isPerformingToggle : false,


        init : function(modulesCount) {
            this._modulesCount = modulesCount ? modulesCount : $('.myl-module-game').length;

            // TODO: make sure only one division module is on the page here
            if($('.ipWidget-MylModules .myl-module-division').length > 1) {
            	alert('You can only have one division module on the page.');
            }

        },

        /**
         * @return int
         */
        getModuleCount : function() {

            return this._modulesCount;

        },


        /**
         * @param moduleName string
         * @param $handle jquery handle
         * @param wrapper Module object
         *
         * Adds a module to be tracked by the division module
         * @return int
         */
        addModule : function(moduleName, $handle, wrapper) {

            if(typeof wrapper === 'undefined') {
                var wrapper = null;
            }

            // use existing, return id
            for(var module in this._modules) {

                if(this._modules[module].module === moduleName) {
                    this._modules[module].done = false;
                    return module;
                }

            }
            // push if new
            this._modules.push({
                'module' : moduleName,
                'handle' : $handle,
                'wrapper' : wrapper,
                'done' : false,
                'isPaused' : false,
                'isDefaultView' : true
            });
            return this._modules.length - 1;
        },

        /**
         * removes a module from division tracking
         */
        removeModule : function(moduleId) {
            this._modules.splice(moduleId, 1);
        },

        /**
         * @return object
         */
        getModule : function(moduleName) {
            var module = this._modules.filter(function(obj) {
                return obj['module'] === moduleName;
            });
            return typeof module[0] !== 'undefined'
                ? module[0] : null;
        },


        /**
         * @return boolean : true if all modules finished current division
         */
        isDoneCycling : function() {
        	var exceptions = ['sponsors', 'messages','teams','announcements'];
            for(var moduleNo in this._modules) {
            	var moduleName = this._modules[moduleNo]['module'];
                if(($.inArray(moduleName, exceptions) == -1)) {
	                if(this._modules[moduleNo].done === false) {
	                    return false;
	                }
                }
            }

            return true;

        },

        /**
         * Pauses only the division from cycling over.
         */
        pauseDivisionCycling : function() {

            this._isPausedDivision = true;

        },

        /**
         * Resume division changing.
         */
        resumeDivisionCycling : function() {

            if(this._modules.length == this._modulesCount
                && !this._isPausedModules
                && this.isDoneCycling()) {

                this.setNextDivisionActive();
            }

            this._isPausedDivision = false;

        },

        /**
         * Pauses all modules that are active.
         */
        pauseModulesCycling : function() {

            for(var moduleNo in this._modules) {

                var module = this._modules[moduleNo];

                // make sure the module is an active style module before pausing it
                if(module.wrapper
                    && module.wrapper.getStatus() == 'active') {

                    module.isPaused = true;
                    module.wrapper.stop();

                }

            }

            this._isPausedModules = true;

        },

        /**
         * Restarts each module that was paused.
         */
        resumeModulesCycling : function() {

            // reset all of the paused done's first so they can notify finished again
            for(var moduleNo in this._modules) {

                var module = this._modules[moduleNo];

                // only unpause the modules we paused
                if(module.isPaused) {
                    module.done = false;
                }

            }

            // then restart the paused modules {these split for loops avoid callback issues}
            for(var moduleNo in this._modules) {

                var module = this._modules[moduleNo];

                // only unpause the modules we paused
                if(module.wrapper && module.isPaused) {

                    module.isPaused = false;
                    module.wrapper.play();

                }
            }

            this._isPausedModules = false;

        },

        /**
         *  Toggles the cycling functionality of the division
         */
        toggleDivisionCycling : function($handle) {

            // do nothing if we're currently toggling
            if(Division._isPerformingToggle) {
                return;
            }

            // setup stopper
            Division._isPerformingToggle = true;

            // perform toggle
            if(Division._isPausedDivision) {
                Division.resumeDivisionCycling();
            } else {
                Division.pauseDivisionCycling();
            }

            $handle.toggleClass('replay');
            $handle.toggleClass('replay-all');

            // allow the module to continue actions on click
            Division._isPerformingToggle = false;
        },

        /**
         *  Toggles the cycling functionality of all of the modules
         */
        toggleModulesCycling : function($handle) {

            // do nothing if we're already middle toggle
            if(Division._isPerformingToggle) {
                return;
            }

            // setup stopper
            Division._isPerformingToggle = true;

            // perform toggle
            if(Division._isPausedModules) {
                Division.resumeModulesCycling();
            } else {
                Division.pauseModulesCycling();
            }

            $handle.toggleClass('pause');
            $handle.toggleClass('play');

            // allow the module to continue actions on click
            Division._isPerformingToggle = false;
        },

        /**
         * @return bool
         */
        isValidDivision : function(division) {

            if (typeof division == 'undefined') {
                return false;
            }

            for(var index in this._divisions) {
                if(division == this._divisions[index].id) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Returns the division list in select object form.
         * @return jquery object
         */
        getDivisionSelect : function(selectedId) {

            var select = $('<select class="division-select">');

            $(this._divisions).each(function() {

                var $element = $('<option>');

                if(this.id == selectedId) {
                    $element.prop('selected', 'selected');
                }

                select.append($element
                    .attr('value', this.id)
                    .text(this.description));
            });

            return select;
        },

        /**
         * Returns the division list in h4 format.
         * @return jquery object
         */
        getDivisionHeaders : function(selectedId) {

            var $headers = $('<div>');

            $(this._divisions).each(function() {

                var $elementWrapper = $('<h4 class="division">');

                // add identifier
                $elementWrapper.attr('data-module-id', this.id);

                var $element = $('<span class="division-desc">');

                // if this is the selected division, set it active
                if(this.id == selectedId) {
                    $elementWrapper.addClass('active');
                }

                // add the display description to the span
                $element.text(this.description);

                // put the span in the wrapper
                $elementWrapper.append($element);

                // add to headers list
                $headers.append($elementWrapper);

            });

            return $headers;
        },

        /**
         * Sets the html contents of a module, storing the default.
         * @param moduleName : name of the modules
         * @param view : view to place in the module {optional : uses default if empty}
         * @param subSelect : sub element to update {optional}
         */
        setModuleView : function(moduleName, view, subSelect) {

            var module = this.getModule(moduleName);

            // get the handle
            var $handle = module.handle;

            if(!$handle) {
                return;
            }

            // store the original view
            if(typeof view !== 'undefined') {
                module.view = $handle.html();
            }

            // subselect
            if(typeof subSelect !== 'undefined' && subSelect.length) {
                $handle = $handle.find(subSelect);
            }

            if(typeof view !== 'undefined') {
                $handle.html(view);
                module.isDefaultView = false;
            } else {
                $handle.html(module.view);
                module.isDefaultView = true;
            }

            //update the weather module after the view is rendered
            if(this.moduleName == 'weather') {
                $handle.css('height', '900px');
            }
        },


        /**
         * Adds listener to the division module and handles options menu events.
         */
        setupDivisionListeners : function() {

            if(!Division.getModuleCount()) {
                return;
            }

            var module = this.getModule('division');

            // we must have a division module on the page
            if(!module) {
                return;
            }

            var $handle = module.handle;

            // we must have a division on the page to do this stuff
            if(!$handle) {
                return;
            }

            // listen for click on the division module
            $handle.on('click', function(event) {

                if(event.target.className.indexOf('division active') >= 0) {
                    $(this).find('.options-menu').toggle('fade');
                }
            });

            // listen for pause division click
            $handle.on('click', '.pause-division', function() {
                Division.toggleDivisionCycling($(this));
                $handle.find('.options-menu').toggle('fade');
            }); 

            // listen for pause all click
            $handle.on('click', '.pause-all', function() {
                Division.toggleModulesCycling($(this));
                $handle.find('.options-menu').toggle('fade');
            });

            // listen for header description click
            $handle.on('click', '.division-desc', function() {

                var selectedId = $(this).parent().attr('data-module-id');

                if(!Division.isValidDivision(selectedId)) {
                    return;
                }

                // force to paused mode
                $handle.find('.options-menu').show('fade');
                $handle.find('.pause-division').removeClass('replay');
                $handle.find('.pause-division').addClass('replay-all');
                Division.pauseDivisionCycling();

                Division.setModuleView(
                    'division',
                    Division.getDivisionSelect(selectedId),
                    '.division-wrapper'
                );
            });

            // handle selecting a module
            $handle.on('change', '.division-select', function() {
                var selectedId = $(this).val();

                if(!Division.isValidDivision(selectedId)) {
                    return;
                }

                // force to paused mode
                $handle.find('.options-menu').show('fade');
                $handle.find('.pause-division').removeClass('replay');
                $handle.find('.pause-division').addClass('replay-all');
                Division.pauseDivisionCycling();

                Division.setModuleView('division', Division.getDivisionHeaders(selectedId), '.division-wrapper');
                Division.refreshData(selectedId);
            });

        },

        /**
         * @return array : copy of current modules, with no handles
         */
        getModulesClean : function() {

            var cleanModules = [];

            for(var module in this._modules) {

                if(this._modules[module]['module'] === 'division') {
                    continue;
                }

                cleanModules.push({
                    'module' : this._modules[module].module,
                    'done' : this._modules[module].done
                });
            }

            return cleanModules;
        },

        /**
         * @return string : current org's request base
         */
        getRequestPath : function() {
            // get the current organization from uri
            var rawUri = window.location.pathname.substr(1, window.location.pathname.length);
            var orgEnd = rawUri.indexOf('/');
            var getLocation = '';        	

            if(orgEnd == -1) {
                getLocation = rawUri+'/';
            } else {
                getLocation = '/'+rawUri.substring(0, orgEnd+1);
            }

            /*
             * Default to MYL's data if can't find the folder
             */
            if(getLocation.length === 0) {
                getLocation = "/MYL/";
            }            
            return getLocation;
        },

        /**
         * Adjusts the height the modules
         *  Sets heights to the height of the tallest module
         */
        setFixedHeight : function() {
            var maxHeight = 20;
            var marginPadding = 36;
            var exceptions = ['scoreboard','division', 'registration', 'messages', 'sponsors', 'officials', 'leagueSelection', 'teams','multiReg', 'announcements','playoffs','organizationTiers', 'standings', 'scheduling'];

            // find max height of the modules
            for(var moduleId in this._modules) {
                var module = this._modules[moduleId];
                var moduleName = module['module'];

                // skip this one if it's not in the main block
                if(!$('.main').find('.myl-module-game.myl-module-' + moduleName).length) {
                    continue;
                }

                var height = module['handle'].height();
                if(height > maxHeight) {
                    maxHeight = height;
                }
            }

            for(var moduleId in this._modules) {
                var module = this._modules[moduleId];
                var moduleName = module['module'];

                if(($.inArray(moduleName, exceptions) == -1)
                    && module.handle.attr('data-module-loaded')) {
                	
                	if(moduleName == 'donations'){
                		
                		continue;
                		
                	}

                    $('.main').find('.myl-module-game.myl-module-' + moduleName).css({
      
                        'overflow' : 'hidden',
                        'height' : 420,
                        'max-height' : 420,
                    });

                }

            }
        },

        /**
         * @param $moduleHandle jquery handle
         * @param callback function
         * Updates the division module
         */
        displayNextDivision : function($moduleHandle, $nextDivision) {

            $moduleHandle.hide('slide', { direction : 'left' }, function() {
                $moduleHandle.removeClass('active');
                $nextDivision.css({'left' : '', 'opacity' : '', 'display' : ''});
                $nextDivision.addClass('active');
            });

        },

        /**
         * @param $moduleHandle jquery handle : module's jquery handle
         * @param moduleName string : name of the module being updated
         * @param data array:strings : new html to display, and status of module
         * @param callback(wrapper, string) : if anything is to be done after data update.
         * Update a module after division change. If the module is inactive, don't
         *  update the data on it after it's been loaded once.
         */
        updateModule : function($moduleHandle, moduleName, data, callback) {

            var self = this;
            var view = data.view;
            var status = data.status;
            var isLoaded = $moduleHandle.attr('data-module-loaded');
            var module = self.getModule(moduleName);

            // if inactive module and the data is loaded, skip update
            if(status == 'inactive' && isLoaded) {
                if(typeof callback === 'function') {
                    return callback(module.wrapper, moduleName);
                }
                return;
            }

            if((moduleName == 'teams' || moduleName == 'messages' || moduleName == 'sponsors')&& isLoaded) {
            	if(typeof callback === 'function') {
                    return callback(module.wrapper, moduleName);
                }
                return;
            }

            $moduleHandle.children().hide('fade', function() {
                    $moduleHandle.html(view);
                    resizeSponsorsModule();
                    if(moduleName == 'weather') {
                        /*var $imageHandle = $moduleHandle.find('img');
                        var imageObject = new Image();
                        imageObject.onload = function() {
                            $moduleHandle.show('fade', function() {
                                */
                                // set data as loaded on all modules
                                //$moduleHandle.attr('data-module-loaded', true);

                                // make all of the modules the same height
                                self.setFixedHeight();

                                if(typeof callback === 'function') {
                                    callback(module.wrapper, moduleName);
                                }
                                /*
                            });
                        }
                        imageObject.src = $imageHandle.attr('src');*/
                    } else {
                        $moduleHandle.show('fade', function() {

                            // set data as loaded on all modules
                            $moduleHandle.attr('data-module-loaded', true);

                            // make all of the modules the same height
                            self.setFixedHeight();

                            if(typeof callback === 'function') {
                                callback(module.wrapper, moduleName);
                            }

                        });
                    }
                });
        },


        /**
         * Set false value for all 'done' keys in modules array
         */
        startNewCycle : function() {
            for(var moduleId in this._modules) {

                if(this._modules[moduleId]['module'] !== 'division') {
                    this._modules[moduleId].wrapper.stop();
                    this._modules[moduleId].done = false;
                }
            }
        },

        /**
         * Called after all cycles are complete. Displays info for next division.
         * @param nextDivision int : the id of the next division to display
         */
        refreshData : function(nextDivision) {

            var getLocation = this.getRequestPath();

            var self = this;

            $.ajax({
                url : getLocation,
                data : {
                    'sa' : 'MylSystem.getUpdatedData',
                    'securityToken' : ip.securityToken,
                    'nextDivision' : nextDivision,
                    'modules' : self.getModulesClean()
                },
                success : function(res) {

                    for(var moduleName in res) {

                        // skip if no response for this module
                        if(!res[moduleName]) {
                            continue;
                        }

                        // save the division list
                        if(moduleName == 'division') {
                            self._divisions = res[moduleName].data.divisionList;
                        }

                        var module = self.getModule(moduleName);

                        // we must have a module to do anything
                        if(!module) {
                            continue;
                        }

                        var $moduleHandle = module.handle;
                        var moduleWrapper = module.wrapper;

                        if(moduleWrapper) {
                            moduleWrapper.stop();
                        }

                        // stop here if no module handle
                        if(!$moduleHandle) {
                            continue;
                        }

                        self.updateModule($moduleHandle, moduleName, res[moduleName], function(moduleWrapper, moduleName) {

                            // update the module's item count
                            moduleWrapper.setCycleCount();

                            // if it's not division, start it. otherwise set as finished
                            if(moduleName !== 'division') {
                                moduleWrapper.play();
                            } else {
                                moduleWrapper.setCycleDone();
                            }

                            // set the module type
                            moduleWrapper.setStatus(res[moduleName].status);

                        });

                    }

                },
            });

        },

        /**
         * Moves cycle system on to next division. calls refreshData
         */
        setNextDivisionActive : function() {

            var $currentDivision = $('.ipWidget-MylModules .division.active');

            var $nextDivision = $currentDivision.next('.relevant');

            // if we've already cycled all divisions, restart.
            if(!$nextDivision.length) {
                $nextDivision = $('.ipWidget-MylModules .division').first();
            }

            // don't cycle if the next division is the same as the current
            if($currentDivision.get(0) == $nextDivision.get(0)
                && $('.ipWidget-MylModules .myl-module-division').attr('data-module-loaded')) {
                return;
            }

            // set all cycles to not done, to prevent callback issues when we update them in refresh
            this.startNewCycle();

            var nextDivisionId = $nextDivision.attr('data-module-id');

            // slide out the current division, display next
            this.displayNextDivision($currentDivision, $nextDivision);

            this.refreshData(nextDivisionId);
        },

        /**
         * @param moduleId int : module that has finished cycling
         * notify division that moduleId is done cycling current division
         */
        setCycleDone : function(moduleId){
            if(this._modules[moduleId].done == true) {
                return;
            }

            this._modules[moduleId].done = true;

            if(this._modules.length == this._modulesCount
                && !this._isPausedModules
                && !this._isPausedDivision
                && this.isDoneCycling()) {
                this.setNextDivisionActive();
            }

        },

    };



    /**
     * @type : Module
     * @info : The module class handles updating each module
     *          when a cycle is finished
     */
    function Module(moduleName, $handle, cycleCount) {
        /**
         * @var moduleName string
         */
        this.moduleName = moduleName;

        /**
         * @var moduleName string
         */
        this.$moduleHandle = $handle;

        /**
         * @var playIntervalId int
         */
        this.playIntervalId = null;

        /**
         * @var notifiedFinishedCycle bool
         */
        this.notifiedFinishedCycle = false;

        /**
         * @var moduleType string
         */
        this.status = 'inactive';

        /**
         * @var moduleId int
         */
        this.moduleId = Division.addModule(moduleName, $handle, this)

        if(typeof cycleCount === 'number') {
            this.leftInCycle = cycleCount;
        } else {
            this.leftInCycle = $handle.find('.active').parent().children().length;
        }

        // if no active scroll items or is division, set to finished. otherwise scroll
        if(this.leftInCycle == 0 || this.moduleName == 'division') {
            this.setCycleDone();
        } else {
            this.play();
        }

    }

    /**
     * @uses Division : calls setCycleDone
     */
    Module.prototype = {

    	invalidTypes : ['H1', 'H2', 'H3', 'H5', 'H6', 'SCRIPT', 'LINK', 'STYLE'],
        /**
         * Sets the number of cycles this module has left in this division
         *  Called from the Division module.
         *  Upon count update, this module assumes it has not notified
         *  Division of a finished cycle (since it hasn't even started yet).
         * @param cycleCount int
         */
        setCycleCount : function(cycleCount) {
            if(typeof cycleCount === 'number') {
                this.leftInCycle = cycleCount;
            } else {
            	var temp = this.invalidTypes;
            	var inCycleCount = 0;
            	this.$moduleHandle.find('.active').parent().children().each(function(){
            		if(($.inArray($(this).prop('nodeName'), temp)) == -1){
            			inCycleCount++;
            		}
            	});
            	this.leftInCycle = inCycleCount;
                //this.leftInCycle = this.$moduleHandle.find('.active').parent().children().length;
            }
            this.notifiedFinishedCycle = false;
        },

        /**
         * If the Division module has not already been notified
         *  of this module finishing its cycle, we notify it.
         */
        setCycleDone : function() {
            if(this.notifiedFinishedCycle) {
                return;
            }
            this.notifiedFinishedCycle = true;
            Division.setCycleDone(this.moduleId);
        },

        /**
         * Decrements the cycleCount, or calls cycle done if none left.
         */
        updateCycle : function() {

            if(this.leftInCycle <= 1) {
                return this.setCycleDone();
            }

            this.leftInCycle--;
        },

        /**
         * Sets the status of module {active, inactive}
         */
        setStatus : function(status) {
            this.status = status;
        },

        /**
         * Gets the module status.
         */
        getStatus : function() {
            return this.status;
        },

        /**
         * Grabs the next item to cycle through and calls update for the count.
         * @param $current jquery handle
         * @return jquery handle : next item in display section
         */
        prepareNextInCycle : function($current) {

            // return null if this is the only one
            if($current.parent().children().length == 1) {
                this.updateCycle();
                return null;
            }

            // find the next
            // allows h4 because of division module, may want to wrap those in divs
            var $next = $current.next().not("h1, h2, h3, h5, h6, script, style, link");
            
            //console.log(this.moduleName);
            //console.log(this.checkValidElement($next));
            
            if(!$next.length) {
                // grab the first of the bunch in the same level as current
                $next = $current.parent().children().first();
                if(this.checkValidElement($next)){
                	$next = $next.next();
                }
            }
            //console.log($next.get(0).tagName);

            $next.css({'left' : '', 'opacity' : ''});
            this.updateCycle();

            return $next;
        },

        /**
         * @return bool : true if handle is defined with length
         */
        isMovable : function($handle) {
            return typeof $handle != 'undefined'
                && $handle.length;
        },

        /**
         * Animates an update on given module
         * @param $current jquery handle
         * @return boolean : false if no cycling, else true
         */
        next : function($current) {
            var self = this;

            // grab the next element or none if there's only one
            var $next = self.prepareNextInCycle($current);

            // return false if current is not moveable
            if(!this.isMovable($current) || $next === null || !this.isMovable($next)) {
                return false;
            }
            $current.hide('fade', function() {
                $current.removeClass('active');

                $next.show('fade', function() {
                    $next.addClass('active');
                    if(self.moduleName == "messages") {
                        self.$moduleHandle.find(".messages.active").removeClass("marquee");
                        var containerWidth = $(this).outerWidth();
                        var textWidth = $(this).find("span").outerWidth();
                        if(containerWidth < textWidth) {
                            self.$moduleHandle.find(".messages.active").addClass("marquee");
                            $(".marquee").marquee();
                        }
                    }
                });

            });
            return true;
        },

        /**
         * Clears the cycle
         */
        stop : function() {
            if(this.playIntervalId !== null) {
                clearInterval(this.playIntervalId);
                this.playIntervalId = null;
            }
        },

        /**
         * Cycles the module's data on an interval
         *  If there is only 1 item in the module, don't cycle.
         *  If the play interval is set, we're already cycling - don't cycle.
         *  Otherwise start the cycle.
         */
        play : function() {

            var self = this;

            // we're now starting, so we shouldn't have notified yet
            this.notifiedFinishedCycle = false;

            // don't set duplicate intervals on the same object
            if(this.playIntervalId !== null) {
                return;
            }

            // cycle until false is returned from self.next
            this.playIntervalId = setInterval(function() {
                if(!self.next(self.$moduleHandle.find('.active'))) {
                    self.stop(this.playIntevalId);
                }
            },10000); // marquee speed
        },
        
        checkValidElement: function($element){
        	var type = $element.prev().prop('nodeName');
        	return !($.inArray(type, this.invalidTypes));
        },
    };

    /**
     * Add a module to Division for each module on the page.
     * Add a listener for division to pause all modules.
     */
    Division.init();
    $('.ipWidget-MylModules .myl-module-game').each(function(_, handle) {

        var $handle = $(handle);
        
        // get the module name
        var moduleName = $handle.attr('data-module-name');

        // make an anon module, a reference to Module will be held by Division
        (new Module(moduleName, $handle));

    });


    Division.setupDivisionListeners();


    /**
     * Checks to see if registration is closed
     *  if it is removes the module from the page
     */
    function checkVisible() {
        var $items = ['registration', 'messages', 'sponsors'];
        $('.ipWidget').find('.myl-module-game').each(function(){
            var $name = $(this).attr('data-module-name');
            var $active = $(this).children('div').data('module-visible');

            if(($.inArray($name, $items) !== -1) && $active == 'no') {
                $(this).parent().css('display', 'none');
            }
        });
    }
    setTimeout(checkVisible, 800);

    /*create a click listener for the roster sorter*/
    $(".roster-sorter").on("click", function(event) {
        var $sorters = $('.roster-sorter');
        var $roster = $(this).parent().siblings(".roster-table-data"); /* workaround for pages with multiple rosters using the same named classes */
        var $rows = $roster.children("div");
        var sortfield = event.target.getAttribute("data-field");
        var sortOrder;

        /*check if we will be sorting ascending or descending*/
        if($(event.target).hasClass("no-sort") || $(event.target).hasClass("desc")) {
            sortOrder = "asc";
        } else {
            sortOrder = "desc";
        }

        /*comparator function for determining how rows will be sorted*/
        $rows.sort(function(a,b) {
            var aAttr = $(a).find("[data-field='" + sortfield + "']").text().toUpperCase();
            var bAttr = $(b).find("[data-field='" + sortfield + "']").text().toUpperCase();
            var cmpLess = aAttr < bAttr;
            var cmpGreater = aAttr > bAttr;
            /*if the sort field is date of birth, sort in chronological order*/
            if(sortfield == "dob" || sortfield == "date") {
            	aAttr = $(a).find("[data-field='" + sortfield + "']").text();
                bAttr = $(b).find("[data-field='" + sortfield + "']").text();
                var aDateArray = aAttr.split("/");
                var bDateArray = bAttr.split("/");
                if (aDateArray.length > 2){
	                var aDate = new Date(aDateArray[2], aDateArray[0], aDateArray[1], 0, 0, 0, 0);
	                var bDate = new Date(bDateArray[2], bDateArray[0], bDateArray[1], 0, 0, 0, 0);
                } else {
                    var aDate = new Date(0, aDateArray[0], aDateArray[1], 0, 0, 0, 0);
	                var bDate = new Date(0, bDateArray[0], bDateArray[1], 0, 0, 0, 0);
                }
                cmpLess = aDate < bDate;
                cmpGreater = aDate > bDate;
            }
            if (sortfield == "number") {
            	/* to correctly sort integer numbers (jersey #s, years, etc.) */
            	cmpLess = Number(aAttr) < Number(bAttr);
            	cmpGreater = Number(aAttr) > Number(bAttr);
            }

            /*swap the comparison variables if we are sorting descending*/
            if(sortOrder=="desc") {
                var temp = cmpLess;
                cmpLess = cmpGreater;
                cmpGreater = temp;
            }

            /*return the comparison results*/
            if(cmpLess) {
                return -1;
            } else if(cmpGreater) {
                return 1;
            } else {
                return 0;
            }
        });
        $rows.fadeTo(100, 0.50);
        $rows.detach().appendTo($roster);
        $rows.fadeTo(600, 1.00);

        //change the sorting arrows to indicate the sort order
        $sorters.switchClass("asc desc", "no-sort");
        if(sortOrder == "asc") {
            $(event.target).switchClass("no-sort", "asc");
        } else {
            $(event.target).switchClass("no-sort", "desc");
        }
    });


    /*************************
     **     TEAM ROSTER     **
     **************************/

    /*create a click listener for when a roster row is clicked*/
    $(".team-roster .roster-row .default-view").on("click", function() {
		toggleRowExpansion(this);
    });

    /*create a click listener for when a parent's name is clicked*/
    $(".team-roster .parent1 > span,.team-roster .parent1, .team-roster .parent2 > span, .team-roster .parent2").on("click", function() {
	    toggleRowExpansion(this);
    });

    /*************************
     **   END TEAM ROSTER   **
     **************************/


    /*************************
     **    UMPIRES ROSTER   **
     **************************/

    /*create a click listener for when a umpire roster row is clicked*/
    $(".umpires-roster .roster-row .default-view").on("click", function() {
		if ($(window).width() <= 480){
			toggleRowExpansion(this);
		}
    });

    /*************************
     **  END UMPIRES ROSTER **
     **************************/


    /*************************
     **  UMPIRES SCHEDULES  **
     **************************/

    /*create a click listener for when a umpire schedule row is clicked*/
    $(".umpire-schedule .roster-row .default-view").on("click", function() {
	   if ($(window).width() <= 480){
			toggleRowExpansion(this);
		}
    });

    /***************************
     ** END UMPIRES SCHEDULES **
     ***************************/

    /******************************
     ** UMPIRE AVAILABILITY PREF **
     ******************************/

    //create a click listener for when a umpire availability is clicked
    $(".umpire-availability-preferences .roster-row .default-view").on("click", function() {
    	if ($(window).width() <= 480){
			toggleRowExpansion(this);
		}
    });

    /*create a click listener for when the umpire availability expander is clicked*/
    $(".umpire-availability-preferences-form .collapsable-form-header").on("click", function() {

	   $(".umpire-availability-preferences .success").fadeOut(350);

       var $expandedView = $(this).siblings(".expanded-form-view");
       toggleExpandedView($expandedView);
    });

    /* Add date and time choosers to the appropriate umpire availability form fields */
    $(".umpire-availability-preferences").ready(function(){
	   $('input[name="start_time"]').ptTimeSelect();
	   $('input[name="end_time"]').ptTimeSelect();
    });

    $(".umpire-availability-preferences").ready(function(){
	   $('input[name="start_date"]').datepicker();
	   $('input[name="end_date"]').datepicker();
    });

    $(".umpire-availability-preferences select, .umpire-availability-preferences input, .umpire-availability-preferences button").on("click", function() {
	   $(".umpire-availability-preferences .success").fadeOut(1000);
    });

    /*create a click listener for when the umpire availability remove button is clicked*/
    $(".umpire-availability-preferences .umpire-availability-preferences-remove").on("click", function() {

	   if (confirm("WARNING: Are you sure you want to delete this availability entry? " +
	   		"This action cannot be undone. " +
	   		"Click OK to continue deleting. " +
	   		"Click CANCEL to return without deleting.")){

			var avail_id = $(this).attr("data-field");

			var getLocation = getRequestPath();
		   $.ajax({
		       url : getLocation,
		       method: "POST",
			   data : {
			       'sa' 			: 'MylSystem.umpAvailPrefRemove',
			       'securityToken'  : ip.securityToken,
			       'avail_id'		: avail_id
			   },
			   success: function(res) {
		           if(res == 1) {
		        	   // delete the row data on the page
		               $("div[class='roster-row'][id='"+avail_id+"']").text("Removed \n")
		               		.css("color", "#e4313d").css("font-weight", "bold").css("float", "right");
		           }
			   }
		   });
	   }

	});

    /**********************************
     ** END UMPIRE AVAILABILITY PREF **
     **********************************/


    /***********************
     ** COACH JERSEY EDIT **
     ***********************/

   /*create a click listener for when the jersey number edit expander is clicked*/
   $(".edit-jersey-form .collapsable-form-header").on("click", function() {
       var $expandedView = $(this).siblings(".expanded-view");
       toggleExpandedView($expandedView);
   });

   /***************************
    ** END COACH JERSEY EDIT **
    ***************************/


   /**************************
    ** COACH OFFICIALS EVAL **
    **************************/

   /*create a change listener for the game select menu in coach officials eval*/
   $(".coach-officials-eval #game-select").change(function () {

       var selectedGameId = $(this).val();
       if (selectedGameId == 0){
    	   $("a[class='addOff']").hide();
		   $("a[class='swingdown-menu']").css("display", "none");
		   $("div[class='ump-select-form']").slideUp(350);
		   $("div[class='submission-date']").css("display", "none");
	       $(".officials-eval-form .eval-form").slideUp(350);

	   } else {
		   $("a[class='addOff']").show();
		   $("a[class='swingdown-menu']").css("display", "none");
	       $(".officials-eval-form .eval-form").slideUp(500);
	       $("div[class='submission-date']").css("display", "none");
	       $("div[class='ump-select-form']").slideUp(350);
	       $("div[id='"+selectedGameId+"']").slideDown(350);
	       $(".coach-officials-eval #ump-select").val('0'); // select ump dropdown is always reset
	       $(".officials-eval-form input[name='gameId']").val(selectedGameId); // set gameId hidden field in the eval form to the selected id

	       // add game id to links for new umpire assignment
	       var primary1 = $(".select-ump").children("a[id='primary1']").attr("href");
	       $(".select-ump").children("a[id='primary1']").attr("href", primary1 + "&Gid=" + selectedGameId);
	       var primary2 = $(".select-ump").children("a[id='primary2']").attr("href");
	       $(".select-ump").children("a[id='primary2']").attr("href", primary2 + "&Gid=" + selectedGameId);
	       var secondary1 = $(".select-ump").children("a[id='secondary1']").attr("href");
	       $(".select-ump").children("a[id='secondary1']").attr("href", secondary1 + "&Gid=" + selectedGameId);
	       var secondary2 = $(".select-ump").children("a[id='secondary2']").attr("href");
	       $(".select-ump").children("a[id='secondary2']").attr("href", secondary2 + "&Gid=" + selectedGameId);
	   }
	});

    // keep track of any changes the user might have made
    $(".coach-officials-eval .officials-eval-form fieldset:nth-child(2) input").on("change", function(){
	   $(this).attr("unsavedchange", "true");
    });

    // slightly different selector to above
    $(".coach-officials-eval .officials-eval-form fieldset:nth-child(2) textarea").on("change", function(){
	   $(this).attr("unsavedchange", "true");
    });

	/*create a change listener for the umpire select menu in coach officials eval.
	if an option is format '0-x', then it is not assigned an official yet.
	if a position is not assigned an official, a link to a popup with further options will appear.
	if a position is assigned and selected, the evaluation form will appear with the proper official data. */
	$(".coach-officials-eval #ump-select").change(function () {

		// reset any help field of validation changes that might have been made from the last evaluation
		$(".coach-officials-eval .officials-eval-form fieldset:nth-child(2) label").each( function() {
    	    $(this).css("color", "#000000");
        });
		$(".coach-officials-eval .officials-eval-form fieldset:nth-child(2) .help-error").each( function() {
    	    $(this).css("display", "none");
        });

        var selectedUmp  = $(this).val();
        var gameId 		= $(this).parents(".ump-select-form").attr("id");
        var umpSelection = $(".ump-select-form[id='"+gameId+"'] option[value='"+selectedUmp+"']").text().split(" - ");
        var umpName      = umpSelection[1]; // get the name of the umpire

       var selectedUmpId 			= selectedUmp.split("-")[0];
       var selectedPosition 	    = selectedUmp.split("-")[1];
       var selectedAssignmentStatus = selectedUmp.split("-")[2];

       var unsavedWork = false;

        $(".coach-officials-eval .officials-eval-form fieldset:nth-child(2) input").each( function() {
    	    if ($(this).attr("unsavedchange") == 'true'){
    	    	unsavedWork = true;
    	    }
        });
        $(".coach-officials-eval .officials-eval-form fieldset:nth-child(2) textarea").each( function() {
    	    if ($(this).attr("unsavedchange") == 'true'){
    	    	unsavedWork = true;
    	    }
        });

        /* pull information about previous evals and if available, fill out the form before display
         * here we also check to see if any unsaved changed were made, and confirm the user wants to leave the eval form */
       if (unsavedWork){
	       if (confirm("Are you sure you want to change the player evaluation?" +
	       		" You have unsaved work on this page." +
	       		" Click OK to continue. Click CANCEL to stay on this evaluation.")){

				unsavedWork = false;
				clearEvalForm();
				changeLinkAndEvalForm(selectedUmpId, selectedPosition, selectedAssignmentStatus, umpName);
				fillFormWithPrevEval(selectedUmpId);
				$(".coach-officials-eval .officials-eval-form input").each( function() {
					$(this).attr('unsavedchange', 'false');
		        });
		        $(".coach-officials-eval .officials-eval-form textarea").each( function() {
		        	$(this).attr('unsavedchange', 'false');
		        });

			} else {
				// construct the current ump select id and reset it back to the ump we are evaluating
				var stayId = $(".coach-officials-eval .officials-eval-form input[name='umpId']").val();
				var stayPosition = $(".coach-officials-eval .officials-eval-form input[name='position']").val();
				var stayStatus = $(".coach-officials-eval .officials-eval-form input[name='assignmentStatus']").val();
				$(".coach-officials-eval #ump-select").val(stayId+"-"+stayPosition+"-"+stayStatus);
			}
       } else {
    	   clearEvalForm();
    	   changeLinkAndEvalForm(selectedUmpId, selectedPosition, selectedAssignmentStatus, umpName);
		   fillFormWithPrevEval(selectedUmpId);
		   $(".coach-officials-eval .officials-eval-form input").each( function() {
	    	    if ($(this).attr("unsavedchange") == 'true'){
	    	    	unsavedWork = true;
	    	    }
	        });
	        $(".coach-officials-eval .officials-eval-form textarea").each( function() {
	    	    if ($(this).attr("unsavedchange") == 'true'){
	    	    	unsavedWork = true;
	    	    }
	        });
       }
	});

	$(".eval-form").on('submit', function ( response ) {
		$(".coach-officials-eval .officials-eval-form .eval-form fieldset:nth-child(2) input").each( function() {
			$(this).attr("unsavedchange", "false");
	    });

		//$(".coach-officials-eval div.form-group.type-blank.name-success.has-error > div").css("display", "block");
		//$(".coach-officials-eval .officials-eval-form .eval-form").slideUp(600);
		//$(".coach-officials-eval .officials-eval-form .submission-date").css("display", "none");
		//$(".coach-officials-eval .officials-eval-form .submit-success").css("display", "block").delay(3000).fadeOut(1000);
	});

	/*****************************
	 * END COACH OFFICIALS EVAL **
	 *****************************/


	/**************************
	 *   SELECT OFFICIALS    **
	 **************************/

	// set up a delegated listener for the submit button on swingdown dialog for selecting an official
	$(document.body).on("click", ".select-official .se-name-form button", function(){

		var maxResultsForOneReturnLink = 15;
	    var firstname = $(".select-official input[name='firstname']").val();
	    var lastname  = $(".select-official input[name='lastname']").val();
	    var leagueId  = $(".select-official input[name='leagueId']").val();

	    var getLocation = getRequestPath();

	    $.ajax({
	        url : getLocation,
	       method: "POST",
		    data : {
		        'sa' 			: 'MylSystem.coachSelectOfficialByName',
		        'securityToken' 	: ip.securityToken,
		        'firstname'		: firstname,
		        'lastname'		: lastname,
		        'leagueId'		: leagueId
		    },
		    success: function(res) {

			    // empty if we have already displayed names here
			    $(".display-officials-results").empty();

			    $(".se-dropdown-form").css("display", "none");
			    $(".se-name-form").css("display", "none");

			    $(".display-officials-results").css("display", "block");
			    $(".display-officials-results-header").css("display", "block");
			    $(".display-officials-help").css("display", "block");
			    $(".select-official a[class='return-to-search-bottom']").css("display", "block");
			    if (res.length > maxResultsForOneReturnLink){
				    $(".select-official a[class='return-to-search-top']").css("display", "block");
			    }

			    if (!res[0]){
				    $(".display-officials-results").append("<div>No Results Found</div>");
				    
			    }

			    $.each(res, function( i ) {
				    if (res[i]['umpId']){
					    $(".display-officials-results").append("<div><a class='umpire' id="+res[i]['umpId']+" href=javascript:void(0) >"+res[i]['name']+"</div>");
					    
				    }
			    });
		    }
	    });
	});

	// set up a delegated listener for selecting an umpire to add to the game evaluation roster
	$(document.body).on("click", ".display-officials-results a", function(){
	   var umpId = $(this).attr("id");

	   var coachId  = $(".select-official input[name='coachId']").val();
	   var teamId   = $(".select-official input[name='teamId']").val();
	   var gameId   = $(".select-official input[name='gameId']").val();
	   var position = $(".select-official input[name='position']").val();
	   var leagueId = $(".select-official input[name='leagueId']").val();

	   var getLocation = getRequestPath();

	   $.ajax({
	       url : getLocation,
	       method: "POST",
		   data : {
		       'sa' 			: 'MylSystem.coachAddOfficialBySearch',
		       'securityToken' 	: ip.securityToken,
		       'umpId'			: umpId,
		       'coachId'		: coachId,
		       'teamId'			: teamId,
		       'gameId'			: gameId,
		       'position'		: position,
		       'leagueId'		: leagueId
		   },
		   success: function(res) {
			   location.reload();
		   }
	   });
	});

	// set up a delegated listener for the return to search button
	$(document.body).on("click", ".select-official a[class='return-to-search-top'],[class='return-to-search-bottom']", function(){
	   $(".se-dropdown-form").css("display", "block");
	   $(".se-name-form").css("display", "block");

	   $(".display-officials-results").css("display", "none");
	   $(".display-officials-results-header").css("display", "none");
	   $(".display-officials-help").css("display", "none");
	   $(".select-official a").css("display", "none");

	});

	/**************************
     * END SELECT OFFICIALS  **
     **************************/


	/**************************
     *    FORGOT LOGIN ID    **
     **************************/

	// set up a delegated listener for the submit button on swingdown dialog for selecting a name
	$(document.body).on("click", ".forgot-login-id .lastname-or-phone-form fieldset:nth-child(2) .name-submit button", function(){

	   var lastname = $(".lastname-or-phone input[name='lastname']").val();
	   var getLocation = getRequestPath();

	   $.ajax({
	       url : getLocation,
	       method: "POST",
		   data : {
		       'sa' 			: 'MylSystem.searchParentsByLastName',
		       'securityToken' 	: ip.securityToken,
		       'lastname'		: lastname
		   },
		   success: function(res) {

			   $(".lastname-or-phone").css("display", "none");

			   // empty if we have already displayed names here
			   $(".display-name-results .results-list").empty();
			   $(".display-name-results").css("display", "block");

			   if (!res[0]){
				   $(".display-name-results .results-list").append("<div>No Results Found</div>");
			   } else {
				   $.each(res, function( i ) {
					   $(".display-name-results .results-list").append("<div><a class='parent' id="+res[i]['id']+" href=# >"+res[i]['name']+"</div>");
				   });
			   }
		   }
	   });
	});

	$(document.body).on("click", ".forgot-login-id .return-to-search", function(){
		$(".display-name-results").css("display", "none");
		$(".lastname-or-phone").css("display", "block");
	});

	// set up a delegated listener for the submit button on swingdown dialog for selecting a parent
	$(document.body).on("click", ".forgot-login-id .display-name-results .results-list a.parent", function(){

	   var parentId = $(this).attr("id");
	   var getLocation = getRequestPath();

	   $.ajax({
	       url : getLocation,
	       method : "POST",
		   data : {
		       'sa' 			: 'MylSystem.getChildrenOfParent',
		       'securityToken' 	: ip.securityToken,
		       'parentId'		: parentId
		   },
		   success: function(res) {

			   $(".display-name-results").css("display", "none");

			   if (!res[0]){
				   $(".forgot-login-id .child-dob").prepend("<div>No Child Found</div>");
			   } else {
				   $(".forgot-login-id .child-dob .child-dob-form input[name='playerId']").val(res[0]['id']);
				   $(".forgot-login-id .child-dob .child-dob-form input[name='parentId']").val(parentId);
				   $(".forgot-login-id .child-dob").css("display", "block");
				   $(".forgot-login-id .child-dob-header").append("<div class='child-name' >Your Child: "+res[0]['name']+"</div>");

			   }
		   }
	   });
	});

	// set up a delegated listener for validating child's birthdate
	$(document.body).on("click", ".forgot-login-id .child-dob-form fieldset:nth-child(2) button.birthdate-validate", function(){

	   var month 	= $("select[name='month']").val();
	   var day 	 	= $("select[name='day']").val();
	   var year  	= $("select[name='year']").val();
	   var playerId = $("input[name='playerId']").val();
	   var parentId = $("input[name='parentId']").val();

	   var getLocation = getRequestPath();

	   $.ajax({
	       url : getLocation,
	       method: "POST",
		   data : {
		       'sa' 			: 'MylSystem.validateChildDOB',
		       'securityToken' 	: ip.securityToken,
		       'month'			: month,
		       'day'			: day,
		       'year'			: year,
		       'playerId'		: playerId
		   },
		   success: function(res) {

			   if (!res){
				   // create error message to display
			   } else {
				   $(".forgot-login-id .new-email-and-password-form input[name='parentId']").val(parentId);
				   $(".forgot-login-id .child-dob").css("display", "none");
				   $(".forgot-login-id .new-email-and-password").css("display", "block");
			   }
		   }
	   });
	});

	/**************************
     *  END FORGOT LOGIN ID  **
     **************************/


	/*****************************
     * UMPIRE AVAILABILITY FORM **
     *****************************/

	/*create a change listener for the game select menu in coach officials eval*/
    $(".umpire-availability-form .ipModuleForm button").click( function () {

    	var availArray = [];
    	var unavailArray = [];
    	var umpId = $("input[name='umpId']").val();
    	var leagueId = $("input[name='leagueId']").val();

    	var doublecheck = false;

    	$(".roster-row").each( function () {
    		if ($("input[data-field='avail']").checked && $("input[data-field='unavail']").checked){
    			doublecheck = true;
    		}

    	});

    	$("input[data-field='avail']").each( function () {
    		if (this.checked){
    			availArray.push({ scheduleId : $(this).attr("scheduleId"), position : $(this).attr("position") });
    		}
    	});
    	$("input[data-field='unavail']").each( function () {
    		if (this.checked){
    			unavailArray.push({ scheduleId : $(this).attr("scheduleId"), position : $(this).attr("position") });
    		}
    	});

    	if (!doublecheck && (availArray.length > 0 || unavailArray.length > 0)){

    		var getLocation = getRequestPath();

		    $.ajax({
		       url : getLocation,
		       method: "POST",
			   data : {
			       'sa' 			: 'MylSystem.setUmpireAvailabilityFromForm',
			       'securityToken' 	: ip.securityToken,
			       'umpId'			: umpId,
			       'leagueId'		: leagueId,
			       'availArray'		: availArray,
			       'unavailArray' 	: unavailArray
			   },
			   success: function(res) {
				   if (res){
				       setTimeout(function(){
				            location.reload();
				        }, 3000);
					   $(".update-success").css("display", "inline-block").delay(3000).fadeOut(1000);
				   } else {
					   $(".update-error").css("display", "inline-block").delay(3000).fadeOut(1000);
				   }
			   }
		   });
    	} else {
    		$(".update-no-data").css("display", "inline-block").delay(3000).fadeOut(1000);
    	}

	});

    /*create a click listener for when the umpire availability expander is clicked*/
    $(".umpire-availability-form .roster-row .default-view div").on("click", function() {
    	if ($(window).width() <= 480){

	 	    if ($(this).siblings().hasClass("collapsed")){
	 		    $(this).siblings(".collapsed").removeClass("collapsed").addClass("expanded");
	 	    } else {
	 		    $(this).siblings(".expanded").removeClass("expanded").addClass("collapsed");
	 	    }

	        var $expandedView = $(this).parent().siblings(".expanded-view");
	        toggleExpandedView($expandedView);
    	}
    });

    /*********************************
     * END UMPIRE AVAILABILITY FORM **
     *********************************/


    /*******************
     * UMPIRE CONFIRM **
     *******************/

    /*create a click listener for when a umpire schedule row is clicked*/
    $(".umpire-confirm .roster-row .default-view div").on("click", function() {
    	if ($(window).width() <= 480){
	 	    if ($(this).siblings().hasClass("collapsed")){
	 		    $(this).siblings(".collapsed").removeClass("collapsed").addClass("expanded");
	 	    } else {
	 		    $(this).siblings(".expanded").removeClass("expanded").addClass("collapsed");
	 	    }
	        var $expandedView = $(this).parent().siblings(".expanded-view");
	        toggleExpandedView($expandedView);
    	}
    });


    // set up a listener for the umpire confirm button, confirms game then moves game to confirmed roster
	$(".umpire-confirm .unconfirmed-games button").on("click", function(){
	   var row 		 = $(this).parent();
	   var confirmId = row.children("input[name='confirmId']").val();
	   var getLocation = getRequestPath();

	   if (confirmId !=  0){
		   $.ajax({
		       url : getLocation,
		       method: "POST",
			   data : {
			       'sa' 			: 'MylSystem.umpConfirmExistingEntry',
			       'securityToken' 	: ip.securityToken,
			       'confirmId'		: confirmId
			   },
			   success: function(res) {
				   if (res){
					   $(this).text("Confirmed \n").css("color", "#32a643").css("font-weight", "bold").css("float", "right");
					   $(".confirmed-games .roster-table-data span[class='no-data']").css("display", "none");

					   var confirmedrow = row.parent().css("color", "#32a643").css("font-weight", "bold");
					   confirmedrow.find("span[class='umpire-confirm-roster-header']").css("color", "black");
					   $(".confirmed-games .roster-table-data").append(confirmedrow);

					   $(".confirmed-games .roster-table-data .roster-row .default-view button").css("display", "none");

				   }
			   }
		   });
	   } else {

		   var umpId = row.children("input[name='umpId']").val();
		   var scheduleId = row.children("input[name='scheduleId']").val();
		   var position = row.children("div[data-field='position']").text();
		   var leagueId = row.children("input[name='leagueId']").val();
		   $.ajax({
		       url : getLocation,
		       method: "POST",
			   data : {
			       'sa' 			: 'MylSystem.umpConfirmNewEntry',
			       'securityToken' 	: ip.securityToken,
			       'umpId'			: umpId,
			       'scheduleId'		: scheduleId,
			       'position'		: position,
			       'leagueId'		: leagueId
			   },
			   success: function(res) {

				    if (res){
				    	$(".confirmed-games .roster-table-data span[class='no-data']").css("display", "none");
				    	$(this).text("Confirmed \n").css("color", "#32a643").css("font-weight", "bold").css("float", "right");

				    	var confirmedrow = row.parent().css("color", "#32a643").css("font-weight", "bold");
				    	confirmedrow.find("span[class='umpire-confirm-roster-header']").css("color", "black");
				    	$(".confirmed-games .roster-table-data").append(confirmedrow);
				    	confirmedrow.find("button").css("display", "none");

				    }
			   }
		   });
	   }
	});

	/***********************
     * END UMPIRE CONFIRM **
     ***********************/


	/************************
     * UMPIRE SUBSTITUTION **
     ************************/

	/*create a click listener for when a umpire sub row is clicked*/
    $(".umpire-substitution .roster-row .default-view div").on("click", function() {
	 	if ($(this).siblings().hasClass("collapsed")){
	 		$(this).siblings(".collapsed").removeClass("collapsed").addClass("expanded");
	 	} else {
	 		$(this).siblings(".expanded").removeClass("expanded").addClass("collapsed");
	 	}

        var $expandedView = $(this).parent().siblings(".expanded-view");
        toggleExpandedView($expandedView);
    });

    /*create a click listener for when a umpire substitution is clicked*/
    $(".umpire-substitution .game-data .roster-table-data .default-view input[type='radio']").on("click", function() {
    	var gameId = $(this).attr("game-id");

    	$(".game-sub-form").slideUp(250);

    	$(".game-sub-form[game-id='"+gameId+"']").slideDown(400);
    	$(".game-sub-form button").attr("game-id", gameId);

    	if ($(this).children().hasClass("collapsed")){
  		   $(this).children(".collapsed").removeClass("collapsed").addClass("expanded");
  	   } else {
  		   $(this).children(".expanded").removeClass("expanded").addClass("collapsed");
  	   }

         var $expandedView = $(this).siblings(".expanded-view");
         toggleExpandedView($expandedView);
    });

    /*create a click listener for when a umpire substitution select is clicked*/
    $(".umpire-substitution .game-sub-form select").change(function () {
    	var position = $(this).val()
    	$(".game-sub-form button").attr("position", position);
    });

    /*create a click listener for when a umpire substitution select is clicked*/
    $(".umpire-substitution .sub-help a").on({
    	mouseenter: function () {
    		$(".sub-help .filler-text").css("display", "none");
    		$(".sub-help .sub-help-text").stop().fadeIn(600).css("display", "block");

    	},
    	mouseleave: function () {

    		$(".sub-help .sub-help-text").stop().fadeOut(600, function () {
    			$(".sub-help .filler-text").stop().css("display", "block");
    		});

    	}

    });

    /*create a click listener for when an umpire clicks to substitute the unconfirmed umpire with himself*/
    $(".umpire-substitution .game-sub-form button").on("click", function() {
        var position   = $(this).attr("position");
        if (position == 0){
            alert("Please select the position you wish to substitute.");
            return;
        }
    	if (confirm("Are you sure you want to substitute yourself in for this position?")){
    		var gameId     = $(this).attr("game-id");
    		//var position   = $(this).attr("position");
    		var scheduleId = $(".game-data .roster-row[game-id='"+gameId+"']").find("input[name='schedule-id']").val();
    		var leagueId   = $(".game-data .roster-table-data").find("input[name='league-id']").val();
    		var umpId      = $(".game-data .roster-table-data").find("input[name='umpire-id']").val();

    		var getLocation = getRequestPath();

    		$.ajax({
 		       url : getLocation,
 		       method: "POST",
 			   data : {
 			       'sa' 			: 'MylSystem.umpSubstitution',
 			       'securityToken' 	: ip.securityToken,
 			       'gameId'			: gameId,
 			       'umpId'			: umpId,
 			       'position'		: position,
 			       'scheduleId'		: scheduleId,
 			       'leagueId'		: leagueId
 			   },
 			   success: function(res) {

 				    if (res){
 				        location.reload();
 				    }
 			   }
 		   });
    	}
    });

    /****************************
     * END UMPIRE SUBSTITUTION **
     ****************************/

	/*set up a listener for the stats entry select box*/
	$("select[name='selectGame']").on('change', function(event) {
        var gameId;
        $("select option:selected").each(function() {
            gameId = $(this).attr("value");
        });
        switchGame(gameId);
        var $enterStatsButton = $(".stats-entry button");
        if(gameId == "") {
            $enterStatsButton.css("display", "none");
        } else {
            $enterStatsButton.css("display", "inline");
        }
	});

    $("#enter-game-stats table tr td:nth-child(n+2) input").on("change", function(event) {
        $(event.target).attr("modified", "");
    });

    //change listener for the check box to show or hide unscheduled games
    $(".public-schedule .unscheduled-filter .checkbox input[name='show-unscheduled']").change(function() {
        var $unscheduledGames  = $(".public-schedule tr[scheduled='0']");
        var $unscheduledTables = $(".public-schedule table[scheduled='0']");
        var $noneScheduledText = $(".public-schedule .none-scheduled");
        if(this.checked) {
            $unscheduledTables.css("display", "table");
            $unscheduledGames.css("display", "table-row");
            $noneScheduledText.css("display", "none");
        } else {
            $unscheduledTables.css("display", "none");
            $unscheduledGames.css("display", "none");
            $noneScheduledText.css("display", "block");
        }
    });

    var scheduleState = 0;
    $(".public-schedule .schedule-filters select").change(function() {

       //change schedule state
       if(scheduleState == 0) {
           if($(this).attr("name") == "filter-team") {
               scheduleState = 1;
           } else if($(this).attr("name") == "filter-division" ) {
               scheduleState = 2;
           }
       } else {
           if($(this).val() == "") {
               if(scheduleState != 2 || $(this).attr("name") != "filter-team") {
                   scheduleState = 0;
               }
           }
       }

       //take action based on state
       if(scheduleState == 0) {
           $(".public-schedule .schedule-filters select").val("");
           $(".public-schedule .schedule-filters select option").css("display", "block");
           $(".public-schedule .schedule-filters select option").prop("disabled", false);
           showAllGames();
           showAllDivisions();
           $(".public-schedule .division-schedule").each( function(){
               applyTableStriping($(this).find("tr"));
           });
       } else if(scheduleState == 1 ) {

           //in the division select box, only display the division of the team that is currently
           //selected
           var selectedTeam = $(".public-schedule .schedule-filters .team-filter select").val();
           var divisionId = $(this).children("option[value='" + selectedTeam + "']").attr("division-id");
           var $divisionSelect = $(".public-schedule .schedule-filters .division-filter select");
           $divisionSelect.children("option").css("display", "none");
           $divisionSelect.children("option[division-id='" + divisionId + "']").css("display", "block");
           $divisionSelect.val(divisionId);

           //show the selected team and division
           showSelectedTeam();
           showSelectedDivision();
       } else if(scheduleState == 2) {

           //in the team select box, only display teams in the division currently selected
           var selectedDivision = $(".public-schedule .schedule-filters .division-filter select").val();
           var $teamSelect = $(".public-schedule .schedule-filters .team-filter select");
           $teamSelect.children("option").css("display", "none");
           $teamSelect.children("option").prop("disabled", true);
           $teamSelect.children("option[division-id='" + selectedDivision + "'], option[division-id='']").css("display", "block");
           $teamSelect.children("option[division-id='" + selectedDivision + "'], option[division-id='']").prop("disabled", false);

           if($teamSelect.val() != '') {
               showSelectedTeam();
           } else {
               showAllGames();
           }
           showSelectedDivision();
       }
    });

    $(".public-schedule .schedule-filters #filter-date").click(function() {
    	removeDateClasses();
        showFromStartDate();
        showBeforeEndDate();
    });

    $("#schedule-end-date,#schedule-start-date").datepicker();

    //set up a listener for the team standings select box
    $(".team-standings #division-select").change(function () {
        var selectedDivision = $(this).val();
        $(".team-standings .division-standings").removeClass("display-standing");
        $(".team-standings .division-standings[division-id='" + selectedDivision + "']").addClass("display-standing");
    });
    var msgEl = $('.messages.active');
    if(msgEl.innerWidth()>msgEl.width()) {
    	msgEl.marquee();
    }

    /*************************
    ** COACH PRACTICES EDIT **
    **************************/

    // keep track of any changes the user might have made on add practice form
    $(".coach-practice-edit .add-practice-form fieldset:nth-child(2) input").on("change", function(){
       $(this).attr("unsavedchange", "true");
    });

    $(".coach-practice-edit .add-practice-form fieldset:nth-child(2) textarea").on("change", function(){
       $(this).attr("unsavedchange", "true");
    });

    // keep track of any changes the user might have made on edit practice form
    $(".coach-practice-edit .edit-practice-form fieldset:nth-child(2) input").on("change", function(){
       $(this).attr("unsavedchange", "true");
    });

    $(".coach-practice-edit .edit-practice-form fieldset:nth-child(2) textarea").on("change", function(){
       $(this).attr("unsavedchange", "true");
    });

    /* Add date and time choosers to the appropriate coach practice edit fields */
    $(".coach-practice-edit").ready(function(){
	   $('input[name="start_time"]').ptTimeSelect();
	   $('input[name="end_time"]').ptTimeSelect();
	   $('input[name="date"]').datepicker({
	       onSelect: function(d, i){
	           if(d !== i.lastVal){
	               $(this).change();
	           }
	      }
	   });
    });

    //create a click listener for when a practice info row is clicked
    $(".coach-practice-edit .roster-row .default-view").on("click", function() {
    	if ($(window).width() <= 480){
    		toggleRowExpansion(this);
		}
    });

	/*create a click listener for when the add practice expander is clicked*/
	$(".coach-practice-edit .add-practice-form .collapsable-form-header").on("click", function() {
	    var editPracticeUnsavedWork = false;
	    var editForm    = $(this).parent().siblings(".edit-practice-form");

	    var addExpandedView  = $(this).siblings(".expanded-form-view");
	    var editExpandedView = editForm.children(".expanded-form-view");

	    editPracticeUnsavedWork = checkEditPracticeFormChanges();

	    if (addExpandedView.css("display") == "none") {
	        if (editExpandedView != "none"){
    	        if (editPracticeUnsavedWork){
    	            if (confirm("WARNING: You have unsaved changes on the page. Are you sure you want to continue? " +
                            "Click OK to continue. " +
                            "Click CANCEL to return.")){

    	                editPracticeUnsavedWork = false;
    	                resetEditPracticeFormChanges();
    	                editExpandedView.slideUp(400);
    	                addExpandedView.slideDown(400);
                    }
    	        } else {
    	            editExpandedView.slideUp(400);
    	            addExpandedView.slideDown(400);
    	        }
	        } else {
	            addExpandedView.slideDown(400);
	        }
	    } else {
	        addExpandedView.slideUp(400);
	    }
	});

	/*create a click listener for when the practice edit button is clicked*/
	$(".coach-practice-edit .roster-table-data a[name='edit']").on("click", function() {

	    var addPracticeUnsavedWork  = false;
	    var editPracticeUnsavedWork = false;

	    var practiceId  = $(this).parent().siblings("input[name='practiceId']").val();

	    var addExpandedView  = $(".add-practice-form .expanded-form-view");
	    var editExpandedView = $(".edit-practice-form .expanded-form-view");
	    var editPracticeForm = editExpandedView.children("form");

	    editPracticeUnsavedWork = checkEditPracticeFormChanges();
	    addPracticeUnsavedWork  = checkAddPracticeFormChanges();

	    if (editExpandedView.css("display") == "none") {
	        if (addExpandedView.css("display") != "none"){
	            if (addPracticeUnsavedWork){
        	        if (confirm("WARNING: You have unsaved changes on the page. Are you sure you want to continue? " +
        	                "Click OK to continue. " +
        	                "Click CANCEL to return.")){

        	            addPracticeUnsavedWork = false;
        	            replaceAndPopulatePracticeForm(addExpandedView, editExpandedView, editPracticeForm, practiceId);
        	            resetEditPracticeFormChanges();
        	            resetAddPracticeFormChanges();
        	        }
    	        } else {
    	            replaceAndPopulatePracticeForm(addExpandedView, editExpandedView, editPracticeForm, practiceId);
    	        }
	        } else {
	            if (editPracticeUnsavedWork){
                    if (confirm("WARNING: You have unsaved changes on the page. Are you sure you want to continue? " +
                            "Click OK to continue. " +
                            "Click CANCEL to return.")){

                        addPracticeUnsavedWork = false;
                        replaceAndPopulatePracticeForm(addExpandedView, editExpandedView, editPracticeForm, practiceId);
                        resetEditPracticeFormChanges();
                        resetAddPracticeFormChanges();
                    }
                } else {
                    replaceAndPopulatePracticeForm(addExpandedView, editExpandedView, editPracticeForm, practiceId);
                }
	        }
	    } else {
	        if (editPracticeUnsavedWork){
    	        if (confirm("WARNING: You have unsaved changes on the page. Are you sure you want to continue? " +
                        "Click OK to continue. " +
                        "Click CANCEL to return.")){
    	            editPracticeUnsavedWork = false;
                    replaceAndPopulatePracticeForm(addExpandedView, editExpandedView, editPracticeForm, practiceId);
                    resetEditPracticeFormChanges();
                    resetAddPracticeFormChanges();
    	        }
	        } else {
	            replaceAndPopulatePracticeForm(addExpandedView, editExpandedView, editPracticeForm, practiceId);
	        }
	    }
	});

	/*create a click listener for when the practice unschedule button is clicked*/
    $(".coach-practice-edit .roster-table-data a[name='remove']").on("click", function() {

        var practiceId = $(this).parent().siblings("input[name='practiceId']").val();

        if (confirm("WARNING: Are you sure you want to unschedule this practice? This action cannot be undone. " +
                "Click OK to continue deleting. " +
                "Click CANCEL to return without deleting.")){

            if ($(".edit-practice-form fieldset:nth-child(1) input[name='practiceId']").val() == practiceId){
                //clearPracticeEditForm($expandedView);
            }
            var getLocation = getRequestPath();
            $.ajax({
                url    : getLocation,
                method : "POST",
                data   : {
                    'sa'            : 'MylSystem.coachRemovePractice',
                    'securityToken' : ip.securityToken,
                    'practiceId'    : practiceId
                },
                success: function(res) {
                    $("div[class='roster-row'][id='"+practiceId+"']").text("Removed \n")
                        .css("color", "#e4313d").css("font-weight", "bold").css("float", "right");
                }
            });
        }
    });

    $(".add-practice").on('submit', function ( response ) {
        setTimeout(function(){
            location.reload();
        }, 2000);
    });

    $(".edit-practice").on('submit', function ( response ) {
        setTimeout(function(){
            location.reload();
        }, 2000);
    });

	/***************************
	* END COACH PRACTICES EDIT *
	****************************/

    /********************
     * VOLUNTEER SIGNUP *
     ********************/    	
        
    
    $(".umpire-feedback-form").on('submit', function ( response ) {
        setTimeout(function(){
            location.reload();
        }, 3000);

        $(".coach-officials-eval .officials-eval-form .submit-success").css("display", "block").delay(3000).fadeOut(1000);
    });
    
    $(".volunteer-signup button.position-signup").on('click', function () {
        var thisDay = $(this).parent().parent();
        var selectedPositions = [];
        thisDay.children(".event-wrapper").children(".position").each( function() {
            if ($(this).children("input").is(':checked')){
                var positionId = $(this).children(".info").children("input[name='positionId']").val();
                var timeslotId = $(this).children(".info").children("input[name='timeslotId']").val();
                var date       = $(this).children(".info").children("input[name='date']").val();
                var position = {
                    pos_id : positionId,
                    ts_id  : timeslotId,
                    date   : date
                }
                selectedPositions.push(position);
            }
        });
        if (selectedPositions.length > 0){
            var getLocation = getRequestPath();
            $.ajax({
                url    : getLocation,
                method : "POST",
                data   : {
                    'sa'                 : 'MylSystem.volunteerSignupSubmit',
                    'securityToken'      : ip.securityToken,
                    'selectedPositions'  : selectedPositions
                },
                success: function(res) {
                    if (res['status'] == "success"){
                        setTimeout(function(){
                            location.reload();
                        }, 2000);

                        thisDay.children(".submit-success"+ res['error']).css("display", "block").delay(2000).fadeOut(1000);
                    } else {
                        thisDay.children(".submit-error." + res['error']).css("display", "block").delay(5000).fadeOut(1000);
                    }
                }

            });
        } else {
            thisDay.children(".submit-error.no-position").css("display", "block").delay(5000).fadeOut(1000);
        }
    });  
    

    /***************************
     * END VOLUNTEER SIGNUP    *
     ***************************/

    /****************************
     * COACH/UMPIRE APPLICATION *
     ****************************/

    $(".coach-application form").ready(function(){
        $('input[name="dob"]').datepicker();
        $('input[custom="custom-date"]').datepicker();
     });

    $(".cofficial-application form").ready(function(){
        $('input[name="dob"]').datepicker();
        $('input[custom="custom-date"]').datepicker();
     });

    /********************************
     * END COACH/UMPIRE APPLICATION *
     ********************************/

    $(".coach-team-picture").on('submit', function ( response ) {
        setTimeout(function(){
            location.reload();
        }, 3000);
    });
    
    
    /*******************
     * MULTIREG MODULE *
     *******************/
    /***********************
     * END MULTIREG MODULE *
     ***********************/
    
    /************************
     * Official Application *
     ************************/
    $('.offPersonSelect').on('change',function() {
        var user = $('.offPersonSelect').val();
        
        if (user != 'New' && user != '0') {
            var getLocation = getRequestPath();
            $.ajax({
                url    : getLocation,
                method : "POST",
                data   : {
                    'sa'                 : 'MylSystem.offAppSelectPerson',
                    'securityToken'      : ip.securityToken,
                    'userId'             : user,
                },
                success: function(res) {
                    $('.offFormView').show();
                    $('input[name=first-name').val(res['firstname']);
                    $('input[name=last-name').val(res['lastname']);
                    $('input[name=address-1').val(res['address1']);
                    $('input[name=address-2').val(res['address2']);
                    $('input[name=city').val(res['city']);
                    $('input[name=state').val(res['state']);
                    $('input[name=zip-code').val(res['zip']);
                    $('input[name=phone-1').val(res['phone1']);
                    $('input[name=email').val(res['email']);
                    $('input[name=selectedPersonId').val(res['selectedPersonId']);
                }
            });
        } else if(user == 'New') {
            $('.offFormView').show();
            $('input[name=first-name').val('');
            $('input[name=last-name').val('');
            $('input[name=address-1').val('');
            $('input[name=address-2').val('');
            $('input[name=city').val('');
            $('input[name=state').val('');
            $('input[name=zip-code').val('');
            $('input[name=phone-1').val('');
            $('input[name=email').val('');
            $('input[name=selectedPersonId').val('New');
        } else {
            $('.offFormView').hide();
        }
    });
    
    /****************************
     * End Official Application *
     ****************************/
    
    /****************
     * Game Confirm *
     ****************/
    
    $('.confirmation').on('click', function(){
    	var elem = $(this);
    	var gameid = $(this).closest('div .gamerow').attr('id');
    	var getLocation = getRequestPath();
    	var playerId; 
    	if($.isEmptyObject($(this).parents('div.child').attr('id'))) {
    		playerId = null;
    	} else {
    		playerId = $(this).parents('div.child').attr('id');
    	}
    	
    	if(confirm('Are you sure you would like to change the confirmation status of this game?')) {
    		if(($.isEmptyObject(this.id))) {
    			$.ajax({
    				url: getLocation,
    				method : "POST",
                    data   : {
                        'sa'                 : 'MylSystem.addGameConfirmation',
                        'securityToken'      : ip.securityToken,
                        'gameid'			 : gameid,
                        'playerid'			 : playerId
                    },
                    success: function(data) {
                    	if(data == "") {
                    		alert("Error connecting to database.");
                    	} else {
	                    	$(elem).html('Confirmed');
	                    	$(elem).attr('id', data.id);
                    	}
                    }
    			});
    		} else {
    			var confirmationId = $(elem).attr('id');
    			var html = $(elem).html();
    			
    			$.ajax({
    				url: getLocation,
    				method: "POST",
    				data: {
    					'sa' : 'MylSystem.changeConfirmationStatus',
    					'securityToken' : ip.securityToken,
    					'confirmationId' : confirmationId,
    					'html' : html
    				},
    				success: function(data) {
    					if(data == "") {
    						alert("Error connecting to database.");
    					} else {
    						$(elem).html(data.status);
    					}
    				}
    			});
    		}
    	}
    });
    
    $('.confirmAll').on('click', function(){
    	$(this).parents('.confirm-table-header').siblings('.gamerow').children().children().each(function(i){
    		if($(this).html() == "Unconfirmed") {
    			$(this).trigger('click');
    		}
    	});
    });
    
    /********************
     * End Game Confirm *
     ********************/
    
    /***********************
     * Player Confirmations*
     ***********************/
	$('#gameSelection').on('change', function(){
		var gameId = $('#gameSelection option:selected').val();
		var teamId = $('#teamId').val();
		var getLocation = getRequestPath();
	
		$.ajax({
			url: getLocation,
			method : "POST",
	        data   : {
	            'sa'                 : 'MylSystem.getGameConfirmations',
	            'securityToken'      : ip.securityToken,
	            'gameId'			 : gameId,
	            'teamId'			 : teamId
	        },
			success: function(response) {
				if(response == "") {
					alert("Error connecting to database.");
				} else {
					$('.confirmTbl').html(response);
				}
			}
		});
	});
    /***********************
     * Player Confirmations*
     ***********************/
	
	/********
	ECOMMERCE
	********/
	$('#product_cat').change(function() {
		var category = $('#product_cat option:selected').val();
		var getLocation = getRequestPath();
		
		$.ajax({
			url: getLocation,
			method : "POST",
			data	: {
				'sa'	: 'MylSystem.getProductsByCategory',
				'securityToken'	: ip.securityToken,
				'category'	: category
			},
			success: function(data) {
				$('.ecom-page-wrapper .product-list').html(data);
				$('.add-to-cart').on('click', function() {
					$('#product-cart-dialog').dialog('open');
				});
			}
		});
	});
	
	$('#product-cart-dialog').dialog({
		autoOpen: false,
		close: function() {
			$('.overlay').hide();
		},
		dialogClass: 'add-dialog'
	});
	
	$('.add-to-cart').on('click', function() {
		$('.overlay').show();
		
		var quantity = $(this).parent('div').find('.quantity').html();
		var price = $(this).parent('div').find('.price').html();
		var itemName = $(this).parent('div').find('.product_name').html();
		var productId = $(this).parent('div').attr('id');
		
		$('#product_id').val(productId);
		
		$('#product-cart-dialog').dialog('option', 'title', itemName);
		
		$('#tot_price').html(price);
		
		$('#base_price').val(price);
		
		$('#product_qty option').remove();
		
		for (var i = 0; i < quantity;) {
			$('#product_qty').append('<option value"' + ++i + '>' + i + '</option>');
		}
		$('#product-cart-dialog').dialog('open');
	});
	
	//change event for quantity select box
	$('#product_qty').on('change', function() {
		var qty = $('#product_qty option:selected').val();
		var price = $('#base_price').val();
		var total = qty * price;
		
		$('#tot_price').html(total);
	});
	
	//click event for add item button
	$('#add-item').on('click', function() {
		var getLocation = getRequestPath();
		var quantity = $('#product_qty option:selected').val();		
		var productId = $('#product_id').val();
		
		$.ajax({
			url: getLocation,
			method : "POST",
			data	: {
				'sa'	: 'MylSystem.addToCart',
				'securityToken'	: ip.securityToken,
				'productId'	: productId,
				'quantity' : quantity
			},
			success: function(response) {
				$('#' + productId).find('.quantity').html(response.inStock);
				
				$('#shopping-cart-dialog').html(response.cart);
				
				$('#product-cart-dialog').dialog('close');
			}
		});
	});
	
	$('#shopping-cart-dialog').dialog({
		autoOpen: false,
		width: 'auto',
		title: 'Cart',
		close: function() {
			$('.overlay').hide();
		},
		buttons: [
          {
        	  text: 'Checkout',
        	  click: function() {
        		  var getLocation = getRequestPath(); 
        		  $.ajax({
        			  url: getLocation,
        			  method: "POST",
        			  data: {
        				  'sa' : 'MylSystem.getCartTotal',
        				  'securityToken': ip.securityToken
        			  },
        			  success: function(data) {
        				  $('#total_charge').val(data);
        				  $('#cartTotal').html(data);
        			  }
        		  });
        		  $('#shopping-cart-dialog').dialog('close');
        		  $('#check-out').dialog('open');
        	  }
          }
		],
		dialogClass: 'cart',
		maxWidth: '350px'
	});
	
	$('#cart').click(function() {
		$('.overlay').show();
		$('#shopping-cart-dialog').dialog('open');
	});
	
	$('#shopping-cart-dialog').on('click', '.update', function() {
		var getLocation = getRequestPath();
		var productSection = $(this).parents('.product-section');
		var qty = $(productSection).find('.quantity').val();
		var productId = $(productSection).attr('data-product-id');
		
		$.ajax({
			url: getLocation,
			method : "POST",
			data: {
				'sa'	: 'MylSystem.updateCart',
				'securityToken'	: ip.securityToken,
				'productId' : productId,
				'quantity' : qty
			},
			success: function(response) {
				alert(response.msg);
				
				var productSection = $('[data-product-id="'+response.productId+'"]');
				$("#" + response.productId).find('.quantity').html(response.inStock);
				
				$(productSection).find('.price').html(response.cost);
			}
		});
	});
	
	$('#shopping-cart-dialog').on('click', '.remove', function() {
		var getLocation = getRequestPath();
		var productSection = $(this).parents('.product-section');
		var productId = $(productSection).attr('data-product-id');
		
		$.ajax({
			url: getLocation,
			method : "POST",
			data: {
				'sa'	: 'MylSystem.removeFromCart',
				'securityToken'	: ip.securityToken,
				'productId' : productId
			},
			success: function(response) {
				$('[data-product-id="'+response.productId+'"]').css('display','none');
				$('#'+response.productId).find('.quantity').html(response.quantity);
				
				console.log($('[data-product-id="'+response.productId+'"]'));
			}
		});
	});
	
	$("#check-out").dialog({
		autoOpen: false,
		height: '800',
		open: function() {
			$('.overlay').show();
		},
		close: function() {
			$('.overlay').hide();
		},
       title: 'Checkout',
       dialogClass: 'checkOut'
	});
	
	$('#sameAsShipping').on('click', function(){
		if($('#sameAsShipping').prop('checked')) {
			$('#firstNameOnCard').val($('#firstName').val());
			$('#lastNameOnCard').val($('#lastName').val());
			$('#billingAddress').val($('#address1').val());
			$('#billingCity').val($('#city').val());
			$('#billingState').val($('#state').val());
			$('#billingZip').val($('#zipCode').val());
		}
	});
	
	/************
	END ECOMMERCE
	*************/
	/*$('.form-group > label').each(function(){
		console.log("called");
		console.log($(this).html());
		$(this).html($(this).html().text());
	});*/
/*
	$('[data-toggle="popover"]').popover(); 
	
	$('a.btn-popover').click(function(e)
			{
			    // Special stuff to do when this link is clicked...

			    // Cancel the default action
			    e.preventDefault();
			});*/
	
	$('#profileMenu').smartmenus();
	$('#main-menu').smartmenus();
	$('.mMenu').smartmenus({
		rightToLeftSubMenus: false,
		
	});
	
	$(function() {
		  var $mainMenuState = $('#main-menu-state');
		  if ($mainMenuState.length) {
		    // animate mobile menu
		    $mainMenuState.change(function(e) {
		      var $menu = $('#main-menu');
		      if (this.checked) {
		        $menu.hide().slideDown(250, function() { $menu.css('display', ''); });
		      } else {
		        $menu.show().slideUp(250, function() { $menu.css('display', ''); });
		      }
		    });
		    // hide mobile menu beforeunload
		    $(window).bind('beforeunload unload', function() {
		      if ($mainMenuState[0].checked) {
		        $mainMenuState[0].click();
		      }
		    });
		  }
		});
	
	/*$('.owl-carousel').owlCarousel({
	    loop:true,
	    margin:10,
	    nav:true,
	    responsive:{
	        0:{
	            items:1
	        },
	        600:{
	            items:3
	        },
	        1000:{
	            items:5
	        }
	    }
	});*/
	
});

function loadSlideShow(){
	$.ajax({
		url: 'Sites/Default/Theme/MylSports/assets/ajax/slideshow_ajax.php',
		method : "POST",
		data: {
		},
		success: function(data){
			$('#slide-show').prepend(data);
			console.log(data);
		}
	});
}
