package au.gov.geoscience.portal.services.methodmaker.filter;

import java.util.ArrayList;
import java.util.List;

import org.auscope.portal.core.services.methodmakers.filter.AbstractFilter;
import org.auscope.portal.core.services.methodmakers.filter.FilterBoundingBox;

public class MineViewFilter extends AbstractFilter {
    List<String> fragments;
    
    public MineViewFilter(String name, String statusUri) {
        fragments = new ArrayList<String>();
        
        if (name != null && !name.isEmpty()) {
            fragments.add(this.generatePropertyIsLikeFragment("erl:name", "*" + name + "*"));
        }
        
        
        if (statusUri != null && !statusUri.isEmpty()) {
            fragments.add(this.generatePropertyIsEqualToFragment("erl:status_uri", statusUri));
        }
        
    }

    @Override
    public String getFilterStringAllRecords() {
        return this.generateFilter(this.generateAndComparisonFragment(fragments.toArray(new String[fragments.size()])));
    }

    @Override
    public String getFilterStringBoundingBox(FilterBoundingBox bbox) {
        List<String> localFragment = new ArrayList<String>(fragments);
        localFragment.add(this.generateBboxFragment(bbox, "erl:shape"));

        return this.generateFilter(
                this.generateAndComparisonFragment(localFragment.toArray(new String[localFragment.size()])));
    }

}
