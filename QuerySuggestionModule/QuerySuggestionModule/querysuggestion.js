$(document).ready(function(){
    // when the page loads, get a the data from the file        
    obtainDataSetFiles();

    // table row hover effect0--------------------------------------------
	$(document).on("mouseenter", "#tablebody > tr:even", function(e) {
    	$(this).css("background-color", "rgb(255, 245, 204)");    
	});

	$(document).on("mouseleave", "#tablebody > tr:even", function(e) {
    	$(this).css("background-color", "rgb(230, 255, 255)");
	});

	$(document).on("mouseenter", "#tablebody > tr:odd", function(e) {
    	$(this).css("background-color", "rgb(229, 204, 255)");
	});

	$(document).on("mouseleave", "#tablebody > tr:odd", function(e) {
    	$(this).css("background-color", "rgb(236, 255, 230)");
	});

    //-------------------

    $(document).on("mouseenter", "#levtablebody > tr:odd", function(e) {
        $(this).css("background-color", "rgb(230, 238, 255)");
    });

    $(document).on("mouseleave", "#levtablebody > tr:even", function(e) {
        $(this).css("background-color", "rgb(245, 245, 239)");
    });

    $(document).on("mouseenter", "#levtablebody > tr:even", function(e) {
        $(this).css("background-color", "rgb(255, 230, 255)");    
    });

    $(document).on("mouseleave", "#levtablebody > tr:odd", function(e) {
        $(this).css("background-color", "rgb(245, 230, 255)");
    });

    //-------------------

    $(document).on("mouseenter", "#recentstablebody > tr:odd", function(e) {
        $(this).css("background-color", "rgb(229, 204, 255)");
    });

    $(document).on("mouseleave", "#recentstablebody > tr:even", function(e) {
        $(this).css("background-color", "rgb(245, 245, 239)");
    });

    $(document).on("mouseenter", "#recentstablebody > tr:even", function(e) {
        $(this).css("background-color", "rgb(255, 245, 204)");    
    });

    $(document).on("mouseleave", "#recentstablebody > tr:odd", function(e) {
        $(this).css("background-color", "rgb(245, 230, 255)");
    });
    
    // ------------------------------------------------------------------

    $(document).on('keypress',function(e) {
    if(e.which == 13) {
        findExactMatch();
    }
});

    $(document).on("click", "tr.resultRow", function(e) {

        var wordRow = jQuery(this).find("td.word");
        if (wordRow != null){
            var isAlreadySaved = findWordInLocalStorage($(wordRow).text());

            if (isAlreadySaved == null){

                if (localStorage.storeCount) {
                  localStorage.storeCount = Number(localStorage.storeCount)+1;
                } else {
                  localStorage.storeCount = 1;
                }

                localStorage.setItem("savedWord" + localStorage.storeCount, $(wordRow).text());

            }
            
            $("#recentstablebody").html("");
            $("#tablebody").html("");
            $("#levtablebody").html("");
            $("#textbox").val("");

            addPopCount($(wordRow).text());
        }       

    }); 

    // when pressing on keyboard       

	$("#textbox").keyup(function(){

        $("#recentstablebody").html("");
        $("#tablebody").html("");
        $("#levtablebody").html("");

        printLocalResults(getLocalResults());        
        // string for creating HTML tags        

        if(ajaxInstance && ajaxInstance.readyState != 4){
        ajaxInstance.abort();
        }

        ajaxInstance = getMatchingResults();        		

        // places the form back in its original position
        if ($("#textbox").val() == ""){
			$(".whitepace").animate({	    	
	    		height: '20vw'
	  		});	  			
		}

        // places the form in the upper part of the page
		else{
			$(".whitepace").animate({	    	
	    		height: '5vw'
	  		});	  		
		}		
		
	});
});

function findWordInLocalStorage(wordToFind){
    for (var i = 1; i <= Number(localStorage.storeCount); i++){
        if (wordToFind == localStorage.getItem("savedWord" + i)){
            return localStorage.getItem("savedWord" + i);
        }
    }
}

function addPopCount(wordToSearch){
    var convertedSpaces = wordToSearch.replace(new RegExp(" ", "g"), '_');
    $.ajax({
        type: "POST",
        url: "TrieManager.asmx/AddPopularityCount",
        data: "wordToSearch=" + convertedSpaces,
        success: function(msg) {
            var alertHTMLString = "<div class='alert alert-info alert-dismissible'><button type='button' class='close' data-dismiss='alert'>&times;</button><strong>Success!</strong> Selected entry has been read</div>"
            $("#alertdisplay").html(alertHTMLString);
            $("#alertdisplay").slideDown();
        },
        error: function(msg) {

        }
    });
}

function findExactMatch(){
    var currentTextboxValue = $("#textbox").val();

    var convertedSpaces = currentTextboxValue.replace(new RegExp(" ", "g"), '_');
    var dataString = {"stringToMatch": convertedSpaces};
    $.ajax({
        type: "POST",
        url: "TrieManager.asmx/SearchExactMatch",
        data: JSON.stringify(dataString),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(msg) {
            var data = eval(msg);
            jQuery.each(data, function(rec) {
                
                var array = JSON.parse(this);

                array.forEach(function(element) {
                alert(element);
                });
            });

        },
        error: function(msg) {

        }
    });
}

var ajaxInstance;
var ajaxLevInstance; 

function getMatchingResults(){
    // string for creating HTML tags
    var matchingInstance;
    var resultRows = "";    
    // ajax method data value
    var currentTextboxValue = $("#textbox").val();

    var convertedSpaces = currentTextboxValue.replace(new RegExp(" ", "g"), '_');
    var dataString = {"stringToMatch": convertedSpaces};

    if ($("#textbox").val() != ""){
        resultRows = "<tr><th colspan='2'>Search results for: " + currentTextboxValue + "</th></tr>";
    }

    $("#loadingspinner").show();        
    matchingInstance = $.ajax({
        type: "POST",
        url: "TrieManager.asmx/GetMatchingResults",
        data: JSON.stringify(dataString),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(msg) {  
            
            var x = 0;

            var data = eval(msg);
            jQuery.each(data, function(rec) {
                
                var array = JSON.parse(this);

                $("#levtablebody").html(" ");

                if(ajaxLevInstance && ajaxLevInstance.readyState != 4){
                        ajaxLevInstance.abort();
                }
                if (array.length < 10){
                    ajaxLevInstance = getLevenshteinResults(array.length);
                }
                else{
                    $("#loadingspinner").hide();
                }
                
                // checks if retrieved array has contents
                if (array.length > 0) {
                    // show as table rows in HTML per array element
                    array.forEach(function(element) {                      
                      var replaceUnderscores = element.val.replace(new RegExp("_", "g"), ' ');                      
                      resultRows += "<tr id='matchresultrow" + x + "' class='resultRow'><td class='word'>"+ replaceUnderscores + "</td><td><small>(Popularity Count: " + element.popCount + ")</small></td></tr>";
                      x++;
                    });
                }
                else{
                    if ($("#textbox").val().length >= 1){
                        resultRows += "<tr><td colspan='2'>No Matching Results Found...</td></tr>";
                    }
                }
            });
            // place appended resultRows string to the HTML Table element body
            $("#tablebody").html(resultRows);

            for (var i = 0; i < x; i++){
                var selectorString = "#matchresultrow" + i;
                $(selectorString).fadeIn((i + 1) * 200);
            }
                         
        },
        error: function(msg) {

        }
    });

    return matchingInstance;
}

function getLevenshteinResults(resultCount){
    var levInstance;
    var levresultRows = "";
    // ajax method data value
    var currentTextboxValue = $("#textbox").val();

    var convertedSpaces = currentTextboxValue.replace(new RegExp(" ", "g"), '_');
    var dataString = {"stringToMatch": convertedSpaces, "matchResultCount": resultCount};    

    levInstance = $.ajax({
        type: "POST",
        url: "TrieManager.asmx/GetLevenshteinResults",
        data: JSON.stringify(dataString),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(msg) {
            $("#loadingspinner").hide();

            var x = 0;

            var data = eval(msg);
            jQuery.each(data, function(rec) {                        
                var array = JSON.parse(this);                    
                // checks if retrieved array has contents
                if (array.length > 0) {
                    levresultRows = "<tr><th colspan='2'>Can't find what you're looking for? Try this other results below:</th></tr>";
                    // show as table rows in HTML per array element                    
                    array.forEach(function(element) {
                      var replaceUnderscores = element.val.replace(new RegExp("_", "g"), ' ');                    
                      levresultRows += "<tr id='levresultrow" + x + "' class='resultRow'><td><small>(Popularity Count: " + element.popCount + ")</small></td><td class='word'>" + replaceUnderscores +"</td></tr>";                                                 
                      x++;
                    });
                }                                        
            });
            // place appended resultRows string to the HTML Table element body
            $("#levtablebody").html(levresultRows);

            for (var i = 0; i < x; i++){
                var selectorString = "#levresultrow" + i;
                $(selectorString).fadeIn((i + 1) * 200);
            }
                         
        },
        error: function(msg) {

        }
    });

    return levInstance;
}

function getLocalResults(){ 
    var currentTextboxValue = $("#textbox").val();
    var storedWordsCount = Number(localStorage.storeCount);    

    var resultArray = [];    
    
    if (currentTextboxValue.length > 0){
        
        for (var i = 1; i <= storedWordsCount; i++){

            var localItem = localStorage.getItem("savedWord" + i);

            if (localItem.length >= currentTextboxValue.length){
                if (localItem.substring(0, currentTextboxValue.length).toLowerCase() == currentTextboxValue.toLowerCase()){
                    resultArray.push(localItem);
                }
            }
        }        
    }

    return resultArray;
}

function printLocalResults(resultArray){
    var recentResultRows = "";
    var storedWordsCount = Number(localStorage.storeCount);

    if (storedWordsCount > 0 && resultArray.length > 0){
        recentResultRows = "<tr><th colspan='2'>Below are results based on your recent searches:</th></tr>";
    }

    var x = 0;
    resultArray.forEach(function(element) {        
        recentResultRows += "<tr id='localresultrow" + x + "' class='resultRow'><td colspan='2' class='word'>" + element + "</td></tr>";
        x++;
    });
    $("#recentstablebody").html(recentResultRows);

    for (var i = 0; i < x; i++){
        var selectorString = "#localresultrow" + i;
        $(selectorString).fadeIn((i + 1) * 200);
    }
}

function obtainDataSetFiles(){
    $.ajax({
        type: "POST",
        url: "BlobManager.asmx/DownloadFromAzureBlob",
        data: "fileNameToDownload=wikidatasetnocomma",
        success: function(msg) {
            $.ajax({
                type: "POST",
                url: "BlobManager.asmx/DownloadFromAzureBlob",
                data: "fileNameToDownload=viewsdataset",
                success: function(msg) {

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

function configureDataSet(){
    $.ajax({
        type: "POST",
        url: "TrieManager.asmx/ConfigureTrieStructure",
        data: "",
        success: function(msg) {
            $("#textbox").attr("placeholder", "Checking Popularity Count Of Entries...");
            configurePopCount();
        },
        error: function(msg) {
            alert(msg);
        }
    });

}

function configurePopCount(){
    $.ajax({
        type: "POST",
        url: "TrieManager.asmx/ConfigurePopularityViewCount",
        data: "fileName=viewsdataset",
        success: function(msg) {
            $("#textbox").removeAttr("disabled");
            $("#textbox").attr("placeholder", "Start typing now. Words will appear as suggestions as you type...");
            $("#loadingspinner").hide();
        },
        error: function(msg) {

        }
    });

}