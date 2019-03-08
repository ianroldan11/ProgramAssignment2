using System;
using System.Collections.Generic;

namespace QuerySuggestionModule
{
    public class TrieNode
    {
        public List<TrieNode> children = new List<TrieNode>();
        // string value of the node
        public StringPopularity key;
        // flag for determining if the node marks as a complete word from its traversal
        public bool isWord;
        // flag for determining if the node functions as a list
        public bool isList;
        // list containing all the strings
        public List<StringPopularity> listOfWords = new List<StringPopularity>();

        public TrieNode(string val, bool isWrd)
        {
            key = new StringPopularity(val);
            isWord = isWrd;
            isList = true;

        }

        public void AddChild(TrieNode node)
        {
            children.Add(node);
        }
    }
}
