var ajaxInstance;       // ajax HTTPrequest object for finding match
var ajaxLevInstance;    // ajax HTTPrequest object for finding levenshtein match

$(document).ready(function(){
    // when the page finishes loading, prepare all files, then construct trie data structure, then check popularity count       
    obtainDataSetFiles();

    var lockAnimation = true;         

    // performs per typing of letter
    $("#textbox").keyup(function(){

        // erases all tables from view
        $("#recentstablebody").html("");
        $("#tablebody").html("");
        $("#levtablebody").html("");

        // gets list of results from local storage then prints it on the recents body table
        printLocalResults(getLocalResults()); 
        // aborts any pending request of ajaxInstance
        if(ajaxInstance && ajaxInstance.readyState != 4){
        ajaxInstance.abort();
        }
        // renews ajax instance with the current string value being searched
        ajaxInstance = getMatchingResults();                

        // sets form placement back to its origina position if textbox is empty
        if ($("#textbox").val() == ""){
            $(".whitepace").animate({           
                height: '20vw'
            });

            $("body").stop().animate({opacity: 0},1000,function(){
            $(this).css({'background-image': "linear-gradient(to top left, rgb(234, 250, 250), rgb(24, 103, 103))"})
            .animate({opacity: 1},{duration:1000});
            });

            lockAnimation = true;                   
        }

        // places the form in the upper part of the page to give space to results
        else{
            $(".whitepace").animate({           
                height: '5vw'
            });      

            if (lockAnimation == true){
                $("body").stop().animate({opacity: 0},1000,function(){
                $(this).css({'background-image': "linear-gradient(to bottom right, rgb(234, 250, 250), rgb(24, 103, 103))"})
                .animate({opacity: 1},{duration:1000});
                });
            }
            lockAnimation = false;         
        }

    });    

    // performs when mouse is clicked in any of the query suggestion
    $(document).on("click", "tr.resultRow", function(e) {
        var wordRow = jQuery(this).find("td.word"); 
        if (wordRow != null){
            simulateUserSearch($(wordRow).text());
        }
    });

    // performs when enter key is pressed
    $(document).on('keypress',function(e) {
        if(e.which == 13) {
            // finds exact match of what the user typed
            findExactMatch();            
        }
    });    

    // table row hover effect0--------------------------------------------
    var mouseEnterEventString = "mouseenter";
    var mouseLeaveEventString = "mouseleave";

    var mainTableBodyID = "#tablebody";
    var levTableBodyID = "#levtablebody";
    var recentTableBodyID = "#recentstablebody";

    //-------------------
   
	$(document).on(mouseEnterEventString, mainTableBodyID + " > tr:even", function(e) {
    	$(this).css("background-color", "rgb(255, 245, 204)");    
	});	

	$(document).on(mouseEnterEventString, mainTableBodyID + " > tr:odd", function(e) {
    	$(this).css("background-color", "rgb(229, 204, 255)");
	});

	$(document).on(mouseLeaveEventString, mainTableBodyID + " > tr:odd", function(e) {
    	$(this).css("background-color", "rgb(230, 255, 255)");
	});

    $(document).on(mouseLeaveEventString, mainTableBodyID + " > tr:even", function(e) {
        $(this).css("background-color", "rgb(236, 255, 230)");
    });

    //-------------------

    $(document).on(mouseEnterEventString, levTableBodyID + " > tr:odd", function(e) {
        $(this).css("background-color", "rgb(230, 238, 255)");
    });   

    $(document).on(mouseEnterEventString, levTableBodyID + " > tr:even", function(e) {
        $(this).css("background-color", "rgb(255, 230, 255)");    
    });

    $(document).on(mouseLeaveEventString, levTableBodyID + " > tr:odd", function(e) {
        $(this).css("background-color", "rgb(245, 245, 239)");
    });

    $(document).on(mouseLeaveEventString, levTableBodyID + " > tr:even", function(e) {
        $(this).css("background-color", "rgb(245, 230, 255)");
    });

    //-------------------

    $(document).on(mouseEnterEventString, recentTableBodyID + " > tr:odd", function(e) {
        $(this).css("background-color", "rgb(229, 204, 255)");
    });

    $(document).on(mouseEnterEventString, recentTableBodyID + " > tr:even", function(e) {
        $(this).css("background-color", "rgb(255, 245, 204)");    
    });

    $(document).on(mouseLeaveEventString, recentTableBodyID + " > tr:odd", function(e) {
        $(this).css("background-color", "rgb(230, 238, 255)");
    });

    $(document).on(mouseLeaveEventString, recentTableBodyID + " > tr:even", function(e) {
        $(this).css("background-color", "rgb(255, 230, 255)");
    });    
    // ------------------------------------------------------------------    
});

//----------------------------------------------------------------------------------------------------------------
//------------------------------------------All-Data-Preparation-Procedures----------------------------------------

var dataSetFileName = "wikidataset";
var viewsDataSetFileName = "viewsdataset";

// tells web service to download the data set file
function obtainDataSetFiles(){
    $.ajax({
        type: "POST",
        url: "BlobManager.asmx/DownloadFromAzureBlob",
        data: "fileNameToDownload=" + dataSetFileName,
        success: function(msg) {
            // After downloading data set, download view count data set next
            $.ajax({
                type: "POST",
                url: "BlobManager.asmx/DownloadFromAzureBlob",
                data: "fileNameToDownload=" + viewsDataSetFileName,
                success: function(msg) {
                    
                    // After downloading view count data set, use data set to create a trie strcuture
                    $("#textbox").attr("placeholder", "Configuring Data Set...");
                    configureDataSet();
                },
                error: function(msg) {

                }
            });
        },
        error: function(msg) {

        }
    });
}

// tells web service to create a trie structure and store it in memory
function configureDataSet(){
    $.ajax({
        type: "POST",
        url: "TrieManager.asmx/ConfigureTrieStructure",
        data: "",
        success: function(msg) {
            // after creating structure, configure the popularity count of each entry in the trie
            $("#textbox").attr("placeholder", "Checking Popularity Count Of Entries...");
            configurePopCount();
        },
        error: function(msg) {
            alert(msg);
        }
    });
}

// tells web service to start checking popularity count per entry in trie
function configurePopCount(){
    $.ajax({
        type: "POST",
        url: "TrieManager.asmx/ConfigurePopularityViewCount",
        data: "fileName=viewsdataset",
        success: function(msg) {
            // enable the text box after finishing all procedures
            enableUserInteractionInTextbox();
        },
        error: function(msg) {

        }
    });
}

// enables textbox to be used by user
function enableUserInteractionInTextbox(){
    $("#textbox").removeAttr("disabled");
    $("#textbox").attr("placeholder", "Start typing now. Words will appear as suggestions as you type...");
    $("#loadingspinner").hide();
}

//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------------------
//-------------------------------------------Local-Storage-Methods--------------------------------------------

// returns an array of matched results (no edit distance) from a list of local storage items
function getLocalResults(){
    // gets current value of textbox 
    var currentTextboxValue = $("#textbox").val();
    // gets the number of items in the local storage
    var storedWordsCount = Number(localStorage.storeCount);    
    // creates array to be returned
    var resultArray = [];    
    // make sure that textbox has length
    if (currentTextboxValue.length > 0){
        // loops through every locally stored item
        for (var i = 1; i <= storedWordsCount; i++){
            // retrieves an item from the storage
            var localItem = localStorage.getItem("savedWord" + i);
            // checks the length
            if (localItem.length >= currentTextboxValue.length){
                // creates substring to compare with the text box value
                if (localItem.substring(0, currentTextboxValue.length).toLowerCase() == currentTextboxValue.toLowerCase()){
                    //includes the local item from the strings to be printed
                    resultArray.push(localItem);
                }
                // limits number of results to ten
                if (resultArray.length >= 10){
                    break;
                }
            }
        }        
    }

    return resultArray;
}

// prints an array to the recents body table
function printLocalResults(resultArray){
    // string to contain HTML string to print
    var recentResultRows = "";
    // gets the number of items stored in the local storage
    var storedWordsCount = Number(localStorage.storeCount);
    // header for table will only show if there are stored items in local storage and if there are any retrieved strings in array
    if (storedWordsCount > 0 && resultArray.length > 0){
        recentResultRows = "<tr><th colspan='2'>Below are results based on your recent searches:</th></tr>";
    }
    // used as uniqued ID for each row
    var x = 0;
    resultArray.forEach(function(element) {        
        recentResultRows += "<tr id='localresultrow" + x + "' class='resultRow'><td colspan='2' class='word'>" + element + "</td></tr>";
        x++;
    });
    // prints it in html format under the tag of the tablebody
    $("#recentstablebody").html(recentResultRows);
    // fade in animation per row
    for (var i = 0; i < x; i++){
        var selectorString = "#localresultrow" + i;
        $(selectorString).fadeIn((i + 1) * 200);
    }
}

//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------------------
//-------------------------------------Data-Source-and-Table-Methods------------------------------------------
var resultsLimit = 10;

// gets results for table
function getMatchingResults(){
    // HTTPrequest object for getting match results from web service
    var matchingInstance;        
    // current textbox value
    var currentTextboxValue = $("#textbox").val();
    // converts all spaces typed by the user to underscores
    var convertedSpaces = currentTextboxValue.replace(new RegExp(" ", "g"), '_');
    // value for ajax method's data key
    var dataString = {"stringToMatch": convertedSpaces};
    // shows loading spinner with loading message
    $("#loadingdetails").text("Loading Match Results...");   
    $("#loadingspinner").show();  
    // ajax method for calling webservice        
    matchingInstance = $.ajax({
        type: "POST",
        url: "TrieManager.asmx/GetMatchingResults",
        data: JSON.stringify(dataString),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(msg) {
            // evaluates message 
            var data = eval(msg);
            // gets returned items of web service from evaluated message
            jQuery.each(data, function(rec) {
                // parses items into an array
                var array = JSON.parse(this);
                // prints each data to the table
                printMatchResuts(array, currentTextboxValue);

                // aborts any pending ajaxLevInstance
                if(ajaxLevInstance && ajaxLevInstance.readyState != 4){
                        ajaxLevInstance.abort();
                }
                // checks if result length is fewer than the max limit of results
                if (array.length < resultsLimit){
                    // call for levenshtein results
                    $("#loadingdetails").text("Checking Misspellings...");
                    ajaxLevInstance = getLevenshteinResults(array.length);
                }
                else{
                    // hides loading screen to signify loading finish
                    $("#loadingspinner").hide();
                }                
            });        
        },
        error: function(msg) {
        }
    });
    return matchingInstance;
}

// prints an array to the table of results
function printMatchResuts(array, currentTextboxValue){
    // HTML string to be printed
    var resultRows = "";
    // make sure levtable body is cleared
    $("#levtablebody").html(" ");

    // only show table heading if there is value in the textbox
    if ($("#textbox").val() != ""){
        resultRows = "<tr><th colspan='2'>Search results for: " + currentTextboxValue + "</th></tr>";
    }

    // checks if retrieved array has contents
    if (array.length > 0) {
        // used as unique identifier for rows
        var x = 0;
        // prints each data from the array
        array.forEach(function(element) {                      
          var replaceUnderscores = element.val.replace(new RegExp("_", "g"), ' ');                      
          resultRows += "<tr id='matchresultrow" + x + "' class='resultRow'><td class='word'>"+ replaceUnderscores + "</td><td><small>(Popularity Count: " + element.popCount + ")</small></td></tr>";
          x++;
        });
    }
    // indicates that there are no matched results
    else{
        if ($("#textbox").val().length >= 1){
            resultRows += "<tr><td colspan='2'>No Matching Results Found...</td></tr>";
        }
    }
    // places html string inside the html tag
    $("#tablebody").html(resultRows);
    // fade in animation per row
    for (var i = 0; i < x; i++){
        var selectorString = "#matchresultrow" + i;
        $(selectorString).fadeIn((i + 1) * 200);
    }
}

// gets results with edit distance uses resultCount to check how many more entries should be printed
function getLevenshteinResults(resultCount){
    //HTTPrequest object for levenshtein searching
    var levInstance;    
    // current textbox value
    var currentTextboxValue = $("#textbox").val();
    //converts spaces to underscores
    var convertedSpaces = currentTextboxValue.replace(new RegExp(" ", "g"), '_');
    // value for ajax method's data key
    var dataString = {"stringToMatch": convertedSpaces, "matchResultCount": resultCount};    
    // ajax methods for call webservice
    levInstance = $.ajax({
        type: "POST",
        url: "TrieManager.asmx/GetLevenshteinResults",
        data: JSON.stringify(dataString),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(msg) {
            // hides loading spinner
            $("#loadingspinner").hide();
            // evaluates msg
            var data = eval(msg);
            jQuery.each(data, function(rec) {                        
                var array = JSON.parse(this);
                // prints array returned from web service
                printLevResults(array, currentTextboxValue);        
            });       
        },
        error: function(msg) {
        }
    });
    return levInstance;
}

// prints an array to the lev table of results
function printLevResults(array, currentTextboxValue){
    // HTML string to show table
    var levresultRows = "";
    // checks if retrieved array has contents
    if (array.length > 0) {
        // table header
        levresultRows = "<tr><th colspan='2'>Can't find what you're looking for? Try this other results below:</th></tr>";
        // unique id per row
        var x = 0;                  
        array.forEach(function(element) {
            // replace underscores to spaces before displaying it
            var replaceUnderscores = element.val.replace(new RegExp("_", "g"), ' ');
            // adds value to table                    
            levresultRows += "<tr id='levresultrow" + x + "' class='resultRow'><td><small>(Popularity Count: " + element.popCount + ")</small></td><td class='word'>" + replaceUnderscores +"</td></tr>";                                                 
            x++;
        });
    }

    // place appended resultRows string to the HTML Table element body
    $("#levtablebody").html(levresultRows);

    // fade in animation
    for (var i = 0; i < x; i++){
        var selectorString = "#levresultrow" + i;
        $(selectorString).fadeIn((i + 1) * 200);
    }
}

//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------------------
//-----------------------------------------------User-Searching-Methods---------------------------------------

// treats the entry as something searched by the user and saves it to local storage
function simulateUserSearch(stringSearched){
    // check if string searched by user is already saved in local       
    var isAlreadySaved = findWordInLocalStorage(stringSearched);
    // saves to local storage if it is not yet already saved
    if (isAlreadySaved == null){
        // increments items count in local storage
        if (localStorage.storeCount) {
          localStorage.storeCount = Number(localStorage.storeCount)+1;
        } else {
          localStorage.storeCount = 1;
        }
        // save to local
        localStorage.setItem("savedWord" + localStorage.storeCount, stringSearched);
    }    
    // restarts view without refreshing page
    $("#recentstablebody").html("");
    $("#tablebody").html("");
    $("#levtablebody").html("");
    $("#textbox").val("");
    // adds popularity count to the entry searched
    addPopCount(stringSearched);    
}

// loops every entry in local storage to check if the word already exists
function findWordInLocalStorage(wordToFind){
    for (var i = 1; i <= Number(localStorage.storeCount); i++){
        if (wordToFind == localStorage.getItem("savedWord" + i)){
            return localStorage.getItem("savedWord" + i);
        }
    }
}

// checks any matching entry of the string typed on text box after pressing enter
function findExactMatch(){
    var currentTextboxValue = $("#textbox").val();

    var convertedSpaces = currentTextboxValue.replace(new RegExp(" ", "g"), '_');
    var dataString = {"stringToMatch": convertedSpaces};
    $.ajax({
        type: "POST",
        url: "TrieManager.asmx/SearchExactMatchByKeyBoard",
        data: JSON.stringify(dataString),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(msg) {
            var data = eval(msg);
            jQuery.each(data, function(rec) {
                // checks if there is any returned match
                if (this != ""){
                    var array = JSON.parse(this);
                    array.forEach(function(element) {
                    // replaces underscores of retrieved data from web service
                    var spacedElement = element.replace(new RegExp("_", "g"), ' ');
                    // corrects character cases of what the user has typed based on the value returned            
                    $("#textbox").val(spacedElement);
                    // performs user search method to the text in the text box
                    simulateUserSearch($("#textbox").val());                    
                    });

                    // restarts view without refreshing page
                    $("#recentstablebody").html("");
                    $("#tablebody").html("");
                    $("#levtablebody").html("");
                    $("#textbox").val("");
                 }

                else{
                    // alerts user that the string typed is not found                    
                    var alertHTMLString = "<div class='alert alert-danger alert-dismissible'><button type='button' class='close' data-dismiss='alert'>&times;</button><strong>Sorry!</strong> Selected entry is not found inside the data</div>"
                    $("#alertdisplay").html(alertHTMLString);
                    $("#alertdisplay").slideDown();
                }

            });

        },
        error: function(msg) {

        }
    });
} 

// finds data in trie that matches the word and then adds its popCount
function addPopCount(wordToSearch){
    var convertedSpaces = wordToSearch.replace(new RegExp(" ", "g"), '_');
    $.ajax({
        type: "POST",
        url: "TrieManager.asmx/AddPopularityCount",
        data: "wordToSearch=" + convertedSpaces,
        success: function(msg) {
            // shows alert indicated that a data has been affected
            var alertHTMLString = "<div class='alert alert-info alert-dismissible'><button type='button' class='close' data-dismiss='alert'>&times;</button><strong>Success!</strong> Selected entry has been read</div>"
            $("#alertdisplay").html(alertHTMLString);
            $("#alertdisplay").slideDown();
        },
        error: function(msg) {

        }
    });
}

//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
