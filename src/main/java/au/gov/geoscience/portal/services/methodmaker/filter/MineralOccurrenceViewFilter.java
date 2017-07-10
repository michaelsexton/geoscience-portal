package au.gov.geoscience.portal.services.methodmaker.filter;

import java.util.ArrayList;
import java.util.List;

import org.auscope.portal.core.services.methodmakers.filter.AbstractFilter;
import org.auscope.portal.core.services.methodmakers.filter.FilterBoundingBox;

public class MineralOccurrenceViewFilter extends AbstractFilter {
    List<String> fragments;

    public MineralOccurrenceViewFilter(String name, String commodityUri, String timescaleUri) {
        fragments = new ArrayList<String>();

        if (name != null && !name.isEmpty()) {
            fragments.add(this.generatePropertyIsLikeFragment("erl:name", "*" + name + "*"));
        }

        if (commodityUri != null && !commodityUri.isEmpty()) {
            fragments.add(this.generatePropertyIsEqualToFragment("erl:representativeCommodity_uri", commodityUri));
        }

        if (timescaleUri != null && !timescaleUri.isEmpty()) {
            fragments.add(this.generatePropertyIsEqualToFragment("erl:representativeAge_uri", timescaleUri));
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
