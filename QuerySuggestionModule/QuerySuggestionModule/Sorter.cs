using System;
using System.Collections.Generic;

namespace QuerySuggestionModule
{
    public class Sorter
    {
        public Sorter()
        {
        }

        public static List<StringPopularity> PopCountSort(List<StringPopularity> stringPopularities)
        {
            stringPopularities.Sort((x, y) =>
            {
                var firstCompare = y.popCount.CompareTo(x.popCount);
                return firstCompare != 0 ? firstCompare : string.Compare(x.val, y.val, StringComparison.Ordinal);
            });
            return stringPopularities;
        }
    }
}
