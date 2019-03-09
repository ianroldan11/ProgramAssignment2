using System;
using System.Collections.Generic;
using System.Text;
namespace QuerySuggestionModule
{
    public class Trie
    {
        private const int maxNumberOfChildrenBeforeBursting = 50;
        // root node the trie
        public readonly TrieNode rootNode = new TrieNode("", false);

        /// <summary>
        /// Inserts the words in the trie either as child nodes/ leaf nodes or as elements of a list"
        /// </summary>
        /// <param name="prefix">Prefix.</param>
        /// <param name="word">Word.</param>
        /// <param name="nodeToBeInsertedTo">Node to be inserted to.</param>
        public void InsertWord(string prefix, string word, TrieNode nodeToBeInsertedTo)
        {
            // check if target node is a list or a node with TrieNode children
            if (nodeToBeInsertedTo.isList)
            {
                // combine prefix and word
                string fullString = prefix + word;
                // insert the fullString in the list
                StringPopularity stringPopularity = new StringPopularity(fullString);
                nodeToBeInsertedTo.listOfWords.Add(stringPopularity);

                // check if the List from this node is already at its limit before bursting
                if (nodeToBeInsertedTo.listOfWords.Count > maxNumberOfChildrenBeforeBursting)
                {
                    // perform BurstTrie algorithm
                    BurstNode(prefix, nodeToBeInsertedTo);
                }
            }

            else
            {
                InsertTrieNodes(prefix, word, nodeToBeInsertedTo);
            }
        }

        /// <summary>
        /// Bursts the node when the number of elements of the list is reached.
        /// </summary>
        /// <param name="prefix">Prefix.</param>
        /// <param name="nodeToBeInsertedTo">Node to be inserted to.</param>
        private void BurstNode(string prefix, TrieNode nodeToBeInsertedTo)
        {
            // sets the node as a parent node instead of a List
            nodeToBeInsertedTo.isList = false;
            // gets each of the string values from the List
            foreach (StringPopularity item in nodeToBeInsertedTo.listOfWords)
            {
                // inserts it 
                string itemSubstring = item.val.Substring(prefix.Length);
                InsertTrieNodes(prefix, itemSubstring, nodeToBeInsertedTo);
            }
            nodeToBeInsertedTo.listOfWords.Clear();
        }

        /// <summary>
        /// Main function for adding child nodes in the trie
        /// </summary>
        /// <param name="prefix">Contains the comparator for the key value of the nodes traversed.</param>
        /// <param name="word">Contains all the characters that need to be traversed.</param>
        /// <param name="nodeToBeInsertedTo">Node to be inserted to.</param>
        private void InsertTrieNodes(string prefix, string word, TrieNode nodeToBeInsertedTo)
        {
            // makes sure that the word to be searched is not empty
            if (word.Length > 0)
            {
                // keyString will be the value of every node traversed. value retains its parent's value
                // ex. grandparent: p -> parent: po -> child: pot
                string keyString = prefix + word[0].ToString();
                // the substring is the remnant of the orginal string by the user input
                string subString = word.Substring(1);

                // loops through every children of the target node to see if the traversed node already exists
                foreach (TrieNode childNode in nodeToBeInsertedTo.children)
                {
                    if (childNode.key.val.ToLower().Equals(keyString.ToLower()))
                    {
                        // traverses the already existing child node and recur this function using the child node
                        // as the target node instead
                        InsertWord(keyString, subString, childNode);
                        return;
                    }
                }

                // after single or multiple traversals, preforms the code below if there is no child node existing yet

                // creates a new child
                TrieNode newChild = new TrieNode(keyString, false);
                // check if the word string contains only the last letter of the entire word of user's input
                if (word.Length == 1)
                {
                    // set the isWord flag to true for the create node to identify its traversal as a word
                    newChild.isWord = true;
                    nodeToBeInsertedTo.AddChild(newChild);
                }
                else
                {
                    // add a child and then continue to traverse deeper until it reaches the last letter
                    nodeToBeInsertedTo.AddChild(newChild);
                    InsertWord(keyString, subString, newChild);
                }
            }
        }
        /// <summary>
        /// Searches for the TrieNode of the word through trie traversal. Doesn't return the string results of the search
        /// </summary>
        /// <returns>The TrieNode that holds the possible set of strings as results of a query.</returns>
        /// <param name="prefix">Contains the comparator for the key value of the nodes traversed.</param>
        /// <param name="word">contains all the characters that need to be traversed.</param>
        /// <param name="nodeToSearch">Node to search.</param>
        public TrieNode SearchWord(string prefix, string word, TrieNode nodeToSearch)
        {
            // creates a TrieNode object used to be returned
            TrieNode foundNode = null;

            // makes sure that the searched word is not empty
            if (word.Length > 0)
            {
                // checks if the target node is a list instead of a parent node
                if (nodeToSearch.isList)
                {
                    // loop through all strings in the List
                    foreach (StringPopularity item in nodeToSearch.listOfWords)
                    {
                        // excludes the item from the list if its length is less than the length of the user input string
                        if (item.val.Length >= (prefix + word).Length)
                        {
                            // gets the prefix of the item from the list with the exact length of the user input string
                            string itemSubString = item.val.Substring(0, (prefix + word).Length);
                            // do linear search on prefixes of the strings in list
                            if (itemSubString.ToLower().Equals((prefix + word).ToLower()))
                            {
                                // returns the target node
                                return nodeToSearch;
                            }
                        }
                    }
                }

                else
                {
                    // appends the current value of the prefix with the first character of the word
                    string keyString = prefix + word[0].ToString();
                    // traverses each of the child node to find the matching key value of the TrieNode
                    foreach (TrieNode childNode in nodeToSearch.children)
                    {
                        if (childNode.key.val.ToLower().Equals(keyString.ToLower()))
                        {
                            // returns the node if the word contains only the last letter of the entire word to be searched
                            if (word.Length == 1)
                            {
                                return childNode;
                            }
                            // continues to go deeper in traversal
                            else
                            {
                                //removes the character that has already been traversed
                                string subString = word.Substring(1);
                                // recursion
                                foundNode = SearchWord(keyString, subString, childNode);
                            }
                            break;
                        }
                    }
                }
            }

            return foundNode;
        }

        /// <summary>
        /// Searches word with levenshtein edit distance.
        /// </summary>
        /// <returns>Returns the results.</returns>
        /// <param name="prefix">Prefix.</param>
        /// <param name="word">Word.</param>
        /// <param name="nodeToSearch">Node to search.</param>
        public List<StringPopularity> LevenshteinSearchWord(string prefix, string word, TrieNode nodeToSearch)
        {
            List<StringPopularity> results = new List<StringPopularity>();
            // make sure word to be search is not blank
            if (word.Length > 0)
            {
                // all characters used for replacement
                string allCharacters = "abcdefghijklmnopqrstuvwxyz_";
                // loops for every character in the word to be searched
                for (int i = 0; i < word.Length; i++)
                {
                    // creates string builder out of the word
                    StringBuilder sb = new StringBuilder(word);
                    // substitute the character at index i of the string builder with every character listed in allCharacters
                    foreach (char character in allCharacters)
                    {
                        // substitution
                        sb[i] = character;
                        // representation of the new word created
                        string newWord = sb.ToString();
                        // since edit distance is 2, nest another loop of character substitution
                        for (int j = 0; j < word.Length; j++)
                        {
                            // code below follows the same process as above
                            StringBuilder newSb = new StringBuilder(newWord);
                            foreach (char character2 in allCharacters)
                            {                                
                                newSb[j] = character2;
                                // after double substitution, search the trie for the string created                              
                                TrieNode trial = SearchWord(prefix, newSb.ToString(), nodeToSearch);
                                // if a match is found
                                if (trial != null && !word.Equals(newSb.ToString()))
                                {
                                    // add all StringPopularity object under that node to the list to be returned
                                    results.AddRange(GetAllWordsFromNode(trial, newSb.ToString()));
                                }
                            }
                        }

                    }
                }
            }
            // sort results before returning
            return Sorter.PopCountSort(results);

        }

        /// <summary>
        /// Gets all the words availabe from the parent node
        /// </summary>
        /// <returns>returns a list of strings containing all the words that matches the result query</returns>
        /// <param name="parentNode">target node.</param>
        /// <param name="rootWord">word to be matched.</param>
        public List<StringPopularity> GetAllWordsFromNode(TrieNode parentNode, string rootWord)
        {
            List<StringPopularity> searchResults = new List<StringPopularity>();

            // check if node is a list instead of a parent node
            if (parentNode.isList)
            {
                // loops through every string and check for prefix match
                foreach (StringPopularity item in parentNode.listOfWords)
                {
                    // make sure item length is greater than the length of the word to be searched
                    if (item.val.Length >= rootWord.Length)
                    {
                        string itemSubString = item.val.Substring(0, rootWord.Length);
                        // check if equal : case insensitive
                        if (itemSubString.ToLower().Equals(rootWord.ToLower()))
                        {
                            searchResults.Add(item);
                        }
                    }

                }
            }

            else
            {
                // adds the key value of the TrieNode currently in if it is a word
                if (parentNode.isWord)
                {
                    searchResults.Add(parentNode.key);
                }
                // traverses to each of its node and check for possible words
                foreach (TrieNode node in parentNode.children)
                {
                    searchResults.AddRange(GetAllWordsFromNode(node, rootWord));
                }
            }
            return Sorter.PopCountSort(searchResults);
        }

        // returns the exact match from a node
        public StringPopularity GetNodeWithExactValue(TrieNode parentNode, string rootWord, bool isCaseSensitive)
        {
            StringPopularity stringPopularity = null;

            // check if node is a list instead of a parent node
            if (parentNode.isList)
            {
                // loops through every string and check for prefix match
                foreach (StringPopularity item in parentNode.listOfWords)
                {
                    // check if case sensitive (used for exact searching i.e. clicking a row in the table)
                    if (isCaseSensitive)
                    {
                        if (item.val.Equals(rootWord))
                        {
                            return item;
                        }
                    }
                    // check if case insensitive (used for blind searching i.e. user typing on a text box and pressing enter)
                    else
                    {
                        if (item.val.ToLower().Equals(rootWord.ToLower()))
                        {
                            return item;
                        }
                    }
                }
            }

            else
            {
                // adds the key value of the TrieNode currently in if it is a word
                if (parentNode.isWord)
                {
                    return parentNode.key;
                }
                // traverses to each of its node and check for possible words

            }

            return stringPopularity;
        }

        // adds popCount to the StringPopularity of the searched node
        public void AddPopCount(string wordToSearch)
        {
            // searches for the node containing the string
            TrieNode targetNode = SearchWord("", wordToSearch, rootNode);
            // if there is a match,
            if (targetNode != null)
            {
                // increment its popCount
                StringPopularity stringPopularity = GetNodeWithExactValue(targetNode, wordToSearch, true);
                if (stringPopularity != null)
                {
                    stringPopularity.popCount++;
                }
            }
        }
    }
}
