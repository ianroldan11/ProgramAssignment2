using System;
namespace QuerySuggestionModule
{
    public class StringPopularity
    {
        public string val;
        public int popCount;

        public StringPopularity(string value)
        {
            val = value;
            popCount = 0;
        }
    }
}
