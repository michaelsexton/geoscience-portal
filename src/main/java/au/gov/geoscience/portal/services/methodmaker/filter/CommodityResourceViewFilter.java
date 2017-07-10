package au.gov.geoscience.portal.services.methodmaker.filter;

import java.util.ArrayList;
import java.util.List;

import org.auscope.portal.core.services.methodmakers.filter.AbstractFilter;
import org.auscope.portal.core.services.methodmakers.filter.FilterBoundingBox;

import au.gov.geoscience.portal.services.vocabularies.VocabularyLookup;

public class CommodityResourceViewFilter extends AbstractFilter {

    List<String> fragments;

    public CommodityResourceViewFilter(String mineralOccurrenceName, String commodityUri, String jorcCategoryUri) {

        String propertyIsNull;
        String notNull;

        fragments = new ArrayList<String>();

        if (mineralOccurrenceName != null && !mineralOccurrenceName.isEmpty()) {
            fragments.add(this.generatePropertyIsLikeFragment("erl:mineralOccurrenceName",
                    "*" + mineralOccurrenceName + "*"));
        }

        if (commodityUri != null && !commodityUri.isEmpty()) {
            fragments.add(this.generatePropertyIsEqualToFragment("erl:commodityClassifier_uri", commodityUri));
        }

        if (jorcCategoryUri != null && !commodityUri.isEmpty()) {
            if (jorcCategoryUri.startsWith(VocabularyLookup.RESERVE_CATEGORY.uri())) {
                if (jorcCategoryUri.equals(VocabularyLookup.RESERVE_CATEGORY.uri())) {
                    propertyIsNull = this.generatePropertyIsNull("erl:reservesCategory_uri");
                    notNull = this.generateNotComparisonFragment(propertyIsNull);
                    fragments.add(notNull);
                } else {
                    fragments.add(this.generatePropertyIsEqualToFragment("erl:reservesCategory_uri", jorcCategoryUri));
                }
            } else if (jorcCategoryUri.startsWith(VocabularyLookup.RESOURCE_CATEGORY.uri())) {
                if (jorcCategoryUri.equals(VocabularyLookup.RESOURCE_CATEGORY.uri())) {
                    propertyIsNull = this.generatePropertyIsNull("erl:resourcesCategory_uri");
                    notNull = this.generateNotComparisonFragment(propertyIsNull);
                    fragments.add(notNull);
                } else {
                    fragments.add(this.generatePropertyIsEqualToFragment("erl:resourcesCategory_uri", jorcCategoryUri));
                }

            }
        }
    }

    public String getFilterStringAllRecords() {
        return this.generateFilter(this.generateAndComparisonFragment(fragments.toArray(new String[fragments.size()])));
    }

    public String getFilterStringBoundingBox(FilterBoundingBox bbox) {
        List<String> localFragment = new ArrayList<String>(fragments);
        localFragment.add(this.generateBboxFragment(bbox, "erl:shape"));

        return this.generateFilter(
                this.generateAndComparisonFragment(localFragment.toArray(new String[localFragment.size()])));
    }

}
