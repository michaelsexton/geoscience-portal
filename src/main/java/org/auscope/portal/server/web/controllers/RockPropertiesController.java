package org.auscope.portal.server.web.controllers;

import org.auscope.portal.core.server.OgcServiceProviderType;
import org.auscope.portal.core.server.controllers.BasePortalController;
import org.auscope.portal.core.services.methodmakers.filter.FilterBoundingBox;
import org.auscope.portal.core.services.responses.wfs.WFSTransformedResponse;
import org.auscope.portal.server.web.service.RockPropertiesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

@Controller
public class RockPropertiesController extends BasePortalController {

	private RockPropertiesService rockPropertiesService;

	@Autowired
	public RockPropertiesController(RockPropertiesService rockPropertiesService) {
		this.rockPropertiesService = rockPropertiesService;
	}

	@RequestMapping("/getRockPropertiesFeatures.do")
	public ModelAndView getRockPropertiesFeatures(@RequestParam("serviceUrl") String serviceUrl,
			@RequestParam(required = false, value = "rockProperty") String rockProperty,
			@RequestParam(required = false, value = "bbox") String bboxJson,
			@RequestParam(required = false, value = "maxFeatures", defaultValue = "0") int maxFeatures) {

		OgcServiceProviderType ogcServiceProviderType = OgcServiceProviderType.parseUrl(serviceUrl);
		FilterBoundingBox bbox = FilterBoundingBox.attemptParseFromJSON(bboxJson, ogcServiceProviderType);
		WFSTransformedResponse response = null;

		try {
			response = this.rockPropertiesService.getRockProperties(serviceUrl, rockProperty, maxFeatures, bbox);
		} catch (Exception e) {
			return this.generateExceptionResponse(e, serviceUrl);
		}

		return generateJSONResponseMAV(response.getSuccess(), response.getGml(), response.getTransformed(),
				response.getMethod());
	}

}
