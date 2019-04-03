package org.auscope.portal.server.web.service;

import java.io.InputStream;
import org.apache.http.client.methods.HttpRequestBase;
import org.auscope.portal.core.server.http.HttpServiceCaller;
import org.auscope.portal.core.services.BaseWFSService;
import org.auscope.portal.core.services.PortalServiceException;
import org.auscope.portal.core.services.methodmakers.WFSGetFeatureMethodMaker;
import org.auscope.portal.core.services.methodmakers.WFSGetFeatureMethodMaker.ResultType;
import org.auscope.portal.core.services.methodmakers.filter.FilterBoundingBox;
import org.auscope.portal.core.services.methodmakers.filter.SimpleBBoxFilter;
import org.auscope.portal.core.services.responses.wfs.WFSCountResponse;
import org.auscope.portal.core.services.responses.wfs.WFSTransformedResponse;
import org.auscope.portal.core.xslt.WfsToKmlTransformer;
import org.auscope.portal.mineraloccurrence.RockPropertyNamespaceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * @author u10301
 *
 */
@Service
public class RockPropertyService extends BaseWFSService {

	private WfsToKmlTransformer wfsToKmlTransformer;

	@Autowired
	public RockPropertyService(HttpServiceCaller httpServiceCaller, WFSGetFeatureMethodMaker methodMaker,
			WfsToKmlTransformer wfsToKmlTransformer) {
		super(httpServiceCaller, methodMaker);
		this.wfsMethodMaker.setNamespaces(new RockPropertyNamespaceContext());
		this.wfsToKmlTransformer = wfsToKmlTransformer;

	}

	public WFSTransformedResponse getRockProperties(String serviceUrl, String rockProperty, int maxFeatures,
			FilterBoundingBox bbox) throws Exception {
		SimpleBBoxFilter filter = new SimpleBBoxFilter();
		String filterString = filter.getFilterStringBoundingBox(bbox);
		HttpRequestBase method = null;

		try {
			method = this.generateWFSRequest(serviceUrl, "scalar_results", null, filterString, maxFeatures, null,
					ResultType.Results);
			String responseGML = this.httpServiceCaller.getMethodResponseAsString(method);
			String responseKML = this.wfsToKmlTransformer.convert(responseGML, serviceUrl);
			return new WFSTransformedResponse(responseGML, responseKML, method);
		} catch (Exception e) {

			throw new PortalServiceException(method, e);
		}

	}

	public WFSCountResponse getRockPropertyCount(String serviceUrl, String rockProperty, int maxFeatures,
			FilterBoundingBox bbox) throws Exception {
		SimpleBBoxFilter filter = new SimpleBBoxFilter();
		String filterString = filter.getFilterStringBoundingBox(bbox);
		HttpRequestBase method = generateWFSRequest(serviceUrl, rockProperty, null, filterString, maxFeatures, null,
				ResultType.Hits);
		return getWfsFeatureCount(method);
	}


	/**
	 * @param serviceUrl
	 * @param type
	 * @param filterString
	 * @param outputFormat
	 * @return
	 * @throws Exception
	 */
	public InputStream downloadRockProperties(String serviceUrl, String type, FilterBoundingBox bbox, String outputFormat)
			throws Exception {
		HttpRequestBase method = null;
		try {
			SimpleBBoxFilter filter = new SimpleBBoxFilter();
			String filterString = filter.getFilterStringBoundingBox(bbox);
			method = generateWFSRequest(serviceUrl, type, null, filterString, null, null, ResultType.Results,
					outputFormat);
			return httpServiceCaller.getMethodResponseAsStream(method);

		} catch (Exception ex) {
			throw new PortalServiceException(method, "Error when attempting to download from:" + serviceUrl, ex);
		}

	}

}
