package org.auscope.portal.server.web.controllers;

import java.io.InputStream;
import java.io.OutputStream;

import javax.servlet.http.HttpServletResponse;

import org.auscope.portal.core.server.OgcServiceProviderType;
import org.auscope.portal.core.server.controllers.BasePortalController;
import org.auscope.portal.core.services.methodmakers.filter.FilterBoundingBox;
import org.auscope.portal.core.services.responses.wfs.WFSTransformedResponse;
import org.auscope.portal.core.util.FileIOUtil;
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

	@RequestMapping("/getBulkDensityDownload.do")
	public void getBulkDensityDownload(@RequestParam("serviceUrl") String serviceUrl,
			@RequestParam(required = false, value = "bbox") String bboxJson, HttpServletResponse response)
					throws Exception {
		String rockProperty = "bulk density";
		getRockPropertyDownload(serviceUrl, rockProperty, bboxJson, response);
	}
	
	@RequestMapping("/getChargeabilityDownload.do")
	public void getChargeabilityDownload(@RequestParam("serviceUrl") String serviceUrl,
			@RequestParam(required = false, value = "bbox") String bboxJson, HttpServletResponse response)
					throws Exception {
		String rockProperty = "chargeability";
		getRockPropertyDownload(serviceUrl, rockProperty, bboxJson, response);
	}

	public void getRockPropertyDownload(String serviceUrl, String rockProperty, String bboxJson,
			HttpServletResponse response) throws Exception {
		OgcServiceProviderType ogcServiceProviderType = OgcServiceProviderType.parseUrl(serviceUrl);
		FilterBoundingBox bbox = FilterBoundingBox.attemptParseFromJSON(bboxJson, ogcServiceProviderType);
		String filter = this.rockPropertiesService.getRockPropertyFilter(rockProperty, bbox);
		
		response.setContentType("text/xml");
		OutputStream outputStream = response.getOutputStream();

		InputStream results = this.rockPropertiesService.downloadWFS(serviceUrl, null, filter, null);
		FileIOUtil.writeInputToOutputStream(results, outputStream, 8 * 1024, true);
		outputStream.close();
	}

}
