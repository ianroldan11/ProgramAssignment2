$(document).ready(function(){
    // when the page loads, get a the data from the file
    $.ajax({
        type: "POST",
        url: "BlobManager.asmx/DownloadFromAzureBlob",
        data: "fileNameToDownload=sampledataset",
        success: function(msg) {                
            $("#textbox").removeAttr("disabled");
            $("#textbox").attr("placeholder", "Start typing now. Words will appear as suggestions as you type...");
            $("#loadingspinner").hide();
        },
        error: function(msg) {

        }
    }); 

    // table row hover effect0--------------------------------------------
	$(document).on("mouseenter", "tr:even", function(e) {
    	$(this).css("background-color", "rgb(255, 245, 204)");    
	});

	$(document).on("mouseleave", "tr:even", function(e) {
    	$(this).css("background-color", "rgb(230, 255, 255)");
	});

	$(document).on("mouseenter", "tr:odd", function(e) {
    	$(this).css("background-color", "rgb(229, 204, 255)");
	});

	$(document).on("mouseleave", "tr:odd", function(e) {
    	$(this).css("background-color", "rgb(236, 255, 230)");
	});
    // ------------------------------------------------------------------

    // when pressing on keyboard
	$("#textbox").keyup(function(){
        // string for creating HTML tags
		var resultRows = "";
        // ajax method data value
		var dataString = {"stringToMatch": $("#textbox").val()};

		$.ajax({
            type: "POST",
            url: "TrieManager.asmx/sampleData",
            data: JSON.stringify(dataString),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(msg) {            	
                var data = eval(msg);
                jQuery.each(data, function(rec) {                	
                    var array = JSON.parse(this);
                    // checks if retrieved array has contents
                    if (array.length > 0) {
                        // show as table rows in HTML per array element
                        array.forEach(function(element) {
                          resultRows += "<tr><td>"+ element +"</td></tr>";                                                          
                        });
                    }
                });
                // place appended resultRows string to the HTML Table element body
                $("#tablebody").html(resultRows);
            },
            error: function(msg) {

            }
        });	
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
	  		resultRows = "<tr><th>Search results for: " + $("#textbox").val() + "</th></tr>";
		}		
		
	});
});