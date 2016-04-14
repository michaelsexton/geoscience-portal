package org.auscope.portal.server.web.service;

import java.net.URISyntaxException;

import org.apache.http.client.methods.HttpRequestBase;
import org.auscope.portal.core.server.http.HttpServiceCaller;
import org.auscope.portal.core.services.BaseWFSService;
import org.auscope.portal.core.services.PortalServiceException;
import org.auscope.portal.core.services.methodmakers.WFSGetFeatureMethodMaker;
import org.auscope.portal.core.services.methodmakers.WFSGetFeatureMethodMaker.ResultType;
import org.auscope.portal.core.services.methodmakers.filter.FilterBoundingBox;
import org.auscope.portal.core.services.responses.wfs.WFSTransformedResponse;
import org.auscope.portal.core.xslt.WfsToKmlTransformer;
import org.auscope.portal.mineraloccurrence.RockPropertiesFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RockPropertiesService extends BaseWFSService {

	private WfsToKmlTransformer wfsToKmlTransformer;

	@Autowired
	public RockPropertiesService(HttpServiceCaller httpServiceCaller, WFSGetFeatureMethodMaker methodMaker,
			WfsToKmlTransformer wfsToKmlTransformer) {
		super(httpServiceCaller, methodMaker);
		this.wfsToKmlTransformer = wfsToKmlTransformer;

	}

	public WFSTransformedResponse getRockProperties(String serviceUrl, String rockProperty, int maxFeatures,
			FilterBoundingBox bbox) throws Exception {
		String filterString;
		RockPropertiesFilter rockPropertiesFilter = new RockPropertiesFilter(rockProperty);
		if (bbox == null) {
			filterString = rockPropertiesFilter.getFilterStringAllRecords();
		} else {
			filterString = rockPropertiesFilter.getFilterStringBoundingBox(bbox);
		}
		HttpRequestBase method = null;
		
		try {
			method = this.generateWFSRequest(serviceUrl, "scalar_results", null, filterString, maxFeatures, null, ResultType.Results);
			String responseGML = this.httpServiceCaller.getMethodResponseAsString(method);
			String responseKML = this.wfsToKmlTransformer.convert(responseGML, serviceUrl);
			return new WFSTransformedResponse(responseGML, responseKML, method);
		} catch (Exception e) {

			throw new PortalServiceException(method, e);
		}


	}

}
