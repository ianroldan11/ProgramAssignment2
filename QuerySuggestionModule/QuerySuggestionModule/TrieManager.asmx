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
        public static readonly string dataSetFileName = "wikidataset";
        // sets limit for number of results to be returned
        private static readonly int  ResultCountToReturnLimit = 10;        
        // List of data retrieved from external file
        private static List<string> listOfDataFromFile;        
        // Trie structure to hold data
        private static Trie dataListTrie;
        // boolean flag to tell if view count has already been implemented in the trie
        public static bool popCountIsConfigured = false;

        // getter method for listOfDataFromFile
        private static List<string> GetListOfDataFromFile(){
            // only read from file if list is null
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

        // implements view count data set to the already constructed trie
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

                        StringPopularity stringPopularity = dataListTrie.GetNodeWithExactValue(targetNode, array[1], true);
                        if (stringPopularity != null)
                        {
                            stringPopularity.popCount += Int32.Parse(array[2]);
                        }
                    }
                }
            }
        }        
        
        // method to return results with matching prefix
        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public string GetMatchingResults(string stringToMatch){           
            List<StringPopularity> listToReturn = new List<StringPopularity>();
            // makes sure string to find is not blank
            if (!stringToMatch.Equals("")){
                if (dataListTrie.SearchWord("", stringToMatch, dataListTrie.rootNode)!=null){
                    List<StringPopularity> results = dataListTrie.GetAllWordsFromNode(dataListTrie.SearchWord("", stringToMatch, dataListTrie.rootNode), stringToMatch);
                    listToReturn = results;
                    // limits the number of results to return
                    if (listToReturn.Count > ResultCountToReturnLimit)
                    {
                        listToReturn.RemoveRange(ResultCountToReturnLimit, listToReturn.Count - ResultCountToReturnLimit);
                    }
                }                
            }
            return new JavaScriptSerializer().Serialize(listToReturn);
        }

        // method to return results with edit distance 2
        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public string GetLevenshteinResults(string stringToMatch, int matchResultCount){
            List<StringPopularity> listToReturn = new List<StringPopularity>();
            
            if (!stringToMatch.Equals("")){                
                List<StringPopularity> levenshteinResults = dataListTrie.LevenshteinSearchWord("", stringToMatch, dataListTrie.rootNode);
                // makes sure there are no duplicates in the list
                listToReturn = levenshteinResults.Distinct().ToList();                                                         
                // limits the number of results to return depending on the number of matching results
                int limit = ResultCountToReturnLimit - matchResultCount;
                if (listToReturn.Count > limit)
                {
                    listToReturn.RemoveRange(limit, listToReturn.Count - limit);
                }
            }            
            return new JavaScriptSerializer().Serialize(listToReturn);
        }
        
        // finds the node holding the exact matching string value of the string to match typed by the user
        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public string SearchExactMatchByKeyBoard(string stringToMatch){
            TrieNode targetNode = dataListTrie.SearchWord("", stringToMatch, dataListTrie.rootNode);
            if (targetNode != null){
                StringPopularity stringPopularity = dataListTrie.GetNodeWithExactValue(targetNode, stringToMatch, false);
                if (stringPopularity != null){
                    string[] array = {stringPopularity.val};
                    return new JavaScriptSerializer().Serialize(array);;
                }
            }
            return "";
        }
        
        // method to get all items in list and put it in trie
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
        
        // method to increment 1 popCount to the TrieNode with a matching string
        [WebMethod]
        public void AddPopularityCount(string wordToSearch){
            dataListTrie.AddPopCount(wordToSearch);
        }
        
    }
}
