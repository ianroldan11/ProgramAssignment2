<%@ WebService Language="C#" Class="QuerySuggestionModule.triemanager" %>
using System;
using System.Web.Services;
using System.Web;
using System.Web.Script.Services;
using System.Web.Script.Serialization;
using System.Collections.Generic;
using System.IO;
using System.Linq;

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
        public static readonly string dataSetFileName = "wikidatasetnocomma";

        private static readonly int  ResultCountToReturnLimit = 10;
        
        // List of data retrieved from external file
        private static List<string> listOfDataFromFile;
        
        // getter method for listOfDataFromFile
        private static List<string> GetListOfDataFromFile(){
            if (listOfDataFromFile == null){
                listOfDataFromFile = ReadFromFile(dataSetFileName);
            }
        
            return listOfDataFromFile;
        }
        
        private static Trie dataListTrie;
        
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
        
        public static bool popCountIsConfigured = false;

        [WebMethod]
        public void ConfigurePopularityViewCount(string fileName){
            if (!popCountIsConfigured){
            
                popCountIsConfigured = true;
                
                List<string> viewsDataList = ReadFromFile(fileName);
                // each read search through trie
                foreach (string viewData in viewsDataList)
                {
                    string[] array = viewData.Split(' ');
                    TrieNode targetNode = dataListTrie.SearchWord("", array[1], dataListTrie.rootNode);
                    if (targetNode != null)
                    {

                        StringPopularity stringPopularity = dataListTrie.GetNodeWithExactValue(targetNode, array[1]);
                        if (stringPopularity != null)
                        {
                            stringPopularity.popCount += Int32.Parse(array[2]);
                        }
                    }
                }
            }
        }
        
        
       
        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public string GetMatchingResults(string stringToMatch){            
            
            List<StringPopularity> listToReturn = new List<StringPopularity>();
            
            if (!stringToMatch.Equals("")){
                if (dataListTrie.SearchWord("", stringToMatch, dataListTrie.rootNode)!=null){
                    List<StringPopularity> results = dataListTrie.GetAllWordsFromNode(dataListTrie.SearchWord("", stringToMatch, dataListTrie.rootNode), stringToMatch);
                    
                    listToReturn = results;                    
                    
                    if (listToReturn.Count > ResultCountToReturnLimit)
                    {
                        listToReturn.RemoveRange(ResultCountToReturnLimit, listToReturn.Count - ResultCountToReturnLimit);
                    }
                }
                
            }
            return new JavaScriptSerializer().Serialize(listToReturn);
        }

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public string GetLevenshteinResults(string stringToMatch, int matchResultCount){
            List<StringPopularity> listToReturn = new List<StringPopularity>();
            
            if (!stringToMatch.Equals("")){
                
                List<StringPopularity> levenshteinResults = dataListTrie.LevenshteinSearchWord("", stringToMatch, dataListTrie.rootNode);

                listToReturn = levenshteinResults.Distinct().ToList();                                                         
                
                int limit = ResultCountToReturnLimit - matchResultCount;
                if (listToReturn.Count > limit)
                {
                    listToReturn.RemoveRange(limit, listToReturn.Count - limit);
                }                
                
            }            
            return new JavaScriptSerializer().Serialize(listToReturn);
        }
        
        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public string SearchExactMatch(string stringToMatch){
            TrieNode targetNode = dataListTrie.SearchWord("", stringToMatch, dataListTrie.rootNode);
            if (targetNode != null){
                StringPopularity stringPopularity = dataListTrie.GetNodeWithExactValue(targetNode, stringToMatch);
                if (stringPopularity != null){
                    string[] array = {stringPopularity.val};
                    return new JavaScriptSerializer().Serialize(array);;
                }
            }
            return "";
        }
        
        [WebMethod]
        public void ConfigureTrieStructure(){
            if (dataListTrie == null){
                dataListTrie = new Trie();
                List<string> dataList = ReadFromFile(dataSetFileName);
            
                foreach (string data in dataList)
                {
                    dataListTrie.InsertWord("", data, dataListTrie.rootNode);
                }
            }
        }
        
        [WebMethod]
        public void AddPopularityCount(string wordToSearch){
            dataListTrie.AddPopCount(wordToSearch);
        }
        
    }
}
