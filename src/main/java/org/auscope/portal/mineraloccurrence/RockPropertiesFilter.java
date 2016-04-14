package org.auscope.portal.mineraloccurrence;

import java.util.ArrayList;
import java.util.List;

import org.auscope.portal.core.services.methodmakers.filter.AbstractFilter;
import org.auscope.portal.core.services.methodmakers.filter.FilterBoundingBox;

public class RockPropertiesFilter extends AbstractFilter {
	
	 List<String> fragments;
	
	public RockPropertiesFilter(String rockProperty) {
		fragments = new ArrayList<String>();
		
		if (rockProperty != null && !rockProperty.isEmpty()) {
			fragments.add(this.generatePropertyIsEqualToFragment("ga_rock_properties_wfs:PROPERTY",rockProperty));
		}
	}

	@Override
	public String getFilterStringAllRecords() {
		return this.generateFilter(this.generateAndComparisonFragment(fragments.toArray(new String[fragments.size()])));
	}

	@Override
	public String getFilterStringBoundingBox(FilterBoundingBox bbox) {
		List<String> localFragment = new ArrayList<String>(fragments);
		localFragment.add(this.generateBboxFragment(bbox, "ga_rock_properties_wfs:GEOM"));

		return this.generateFilter(
				this.generateAndComparisonFragment(localFragment.toArray(new String[localFragment.size()])));
	}

}
