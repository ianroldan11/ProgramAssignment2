<%@ WebService Language="C#" Class="QuerySuggestionModule.triemanager" %>
using System;
using System.Web.Services;
using System.Web;
using System.Web.Script.Services;
using System.Web.Script.Serialization;
using System.Collections.Generic;
using System.IO;

namespace QuerySuggestionModule
{

    [WebService(Namespace = "http://tempuri.org/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [System.ComponentModel.ToolboxItem(false)]
    [ScriptService]
	class triemanager : System.Web.Services.WebService
	{
        // String Constants
        public static readonly string fileDirectory = Directory.GetCurrentDirectory() + "/DataFiles/";
        public static readonly string dataSetFileName = "sampledataset";
        
        // List of data retrieved from external file
        private static List<string> listOfDataFromFile;
        
        // getter method for listOfDataFromFile
        private static List<string> GetListOfDataFromFile(){
            if (listOfDataFromFile == null){
                listOfDataFromFile = ReadFromFile(dataSetFileName);
            }
        
            return listOfDataFromFile;
        }
        
        // converts data from file to a list of strings
        private static List<string> ReadFromFile(string fileName)
        {
            Directory.CreateDirectory(fileDirectory);
            List<string> matches = new List<string>();
            StreamReader streamReader = new StreamReader(fileDirectory + fileName);
            string line = streamReader.ReadLine();
            while (line != null)
            {
                matches.Add(line);
                //Read the next line
                line = streamReader.ReadLine();
            }

            return matches;
        }
    
        // sample methods using linear searching-------------------------------------------------------
		[WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
		public string sampleData(string stringToMatch){
        
            //string[] dataStrings = {"dog", "cat", "loaf", "car", "cattle", "dawg", "doge", "sip"};
            List<string> listOfData = GetListOfDataFromFile();
            List<string> listToReturn = new List<string>();
            
            if (!stringToMatch.Equals("")){
                foreach (string data in listOfData){
                    if (isResult(data, stringToMatch)){
                        string spaceReplacedData = data.Replace("_", " ");
                        listToReturn.Add(spaceReplacedData);
                    }
                }
            }
            return new JavaScriptSerializer().Serialize(listToReturn);
        }
        
        private bool isResult(string data,string stringToMatch){
            data = data.ToUpper();
            stringToMatch = stringToMatch.ToUpper();
        
            if (data.Length >= stringToMatch.Length){
                if (data.Substring(0, stringToMatch.ToString().Length).Equals(stringToMatch.ToString())){
                return true;
                }
            }
            return false;
        }
        //--------------------------------------------------------------------------------------------------
        
	}
}
