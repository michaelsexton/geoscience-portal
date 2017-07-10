package au.gov.geoscience.portal.server.controllers;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URISyntaxException;

import javax.servlet.http.HttpServletResponse;

import org.auscope.portal.core.server.OgcServiceProviderType;
import org.auscope.portal.core.server.controllers.BasePortalController;
import org.auscope.portal.core.services.PortalServiceException;
import org.auscope.portal.core.services.methodmakers.filter.FilterBoundingBox;
import org.auscope.portal.core.util.FileIOUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import au.gov.geoscience.portal.services.EarthResourceDownloadService;
import au.gov.geoscience.portal.services.EarthResourceService;

@Controller
public class EarthResourceDownloadController extends BasePortalController {

    private EarthResourceService earthResourceService;
    private EarthResourceDownloadService earthResourceDownloadService;

    @Autowired
    public EarthResourceDownloadController(EarthResourceService earthResourceService,
            EarthResourceDownloadService earthResourceDownloadService) {
        this.earthResourceService = earthResourceService;
        this.earthResourceDownloadService = earthResourceDownloadService;
    }

    @RequestMapping("mineralOccurrenceViewDownload.do")
    public void mineralOccurrenceViewDownload(@RequestParam("serviceUrl") String serviceUrl,
            @RequestParam(required = false, value = "name") String name,
            @RequestParam(required = false, value = "commodityUri") String commodityUri,
            @RequestParam(required = false, value = "timescaleUri") String timescaleUri,
            @RequestParam(required = false, value = "bbox") String bboxJson,
            @RequestParam(required = false, value = "outputFormat") String outputFormat,
            @RequestParam(required = false, value = "maxFeatures", defaultValue = "0") int maxFeatures,
            HttpServletResponse response) throws IOException, PortalServiceException, URISyntaxException {

        OgcServiceProviderType ogcServiceProviderType = OgcServiceProviderType.parseUrl(serviceUrl);
        FilterBoundingBox bbox = FilterBoundingBox.attemptParseFromJSON(bboxJson, ogcServiceProviderType);

        String filter = this.earthResourceService.getMineralOccurrenceViewFilter(name, commodityUri, timescaleUri,
                bbox);
        response.setContentType("text/xml");
        OutputStream outputStream = response.getOutputStream();

        InputStream results = this.earthResourceDownloadService.downloadMineralOccurrenceView(serviceUrl, filter,
                maxFeatures, outputFormat);
        FileIOUtil.writeInputToOutputStream(results, outputStream, 8 * 1024, true);
        outputStream.close();
    }

    @RequestMapping("mineViewDownload.do")
    public void mineViewDownload(@RequestParam("serviceUrl") String serviceUrl,
            @RequestParam(required = false, value = "name") String name,
            @RequestParam(required = false, value = "statusUri") String statusUri,
            @RequestParam(required = false, value = "bbox") String bboxJson,
            @RequestParam(required = false, value = "outputFormat") String outputFormat,
            @RequestParam(required = false, value = "maxFeatures", defaultValue = "0") int maxFeatures,
            HttpServletResponse response) throws IOException, PortalServiceException, URISyntaxException {

        OgcServiceProviderType ogcServiceProviderType = OgcServiceProviderType.parseUrl(serviceUrl);
        FilterBoundingBox bbox = FilterBoundingBox.attemptParseFromJSON(bboxJson, ogcServiceProviderType);

        String filter = this.earthResourceService.getMineViewFilter(name, statusUri, bbox);
        response.setContentType("text/xml");
        OutputStream outputStream = response.getOutputStream();

        InputStream results = this.earthResourceDownloadService.downloadMineView(serviceUrl, filter,
                maxFeatures, outputFormat);
        FileIOUtil.writeInputToOutputStream(results, outputStream, 8 * 1024, true);
        outputStream.close();
    }

    @RequestMapping("commodityResourceViewDownload.do")
    public void commodityResourceViewDownload(@RequestParam("serviceUrl") String serviceUrl,
            @RequestParam(required = false, value = "name") String name,
            @RequestParam(required = false, value = "commodityUri") String commodityUri,
            @RequestParam(required = false, value = "jorcCategoryUri") String jorcCategoryUri,
            @RequestParam(required = false, value = "bbox") String bboxJson,
            @RequestParam(required = false, value = "outputFormat") String outputFormat,
            @RequestParam(required = false, value = "maxFeatures", defaultValue = "0") int maxFeatures,
            HttpServletResponse response) throws IOException, PortalServiceException {
        
        OgcServiceProviderType ogcServiceProviderType = OgcServiceProviderType.parseUrl(serviceUrl);
        FilterBoundingBox bbox = FilterBoundingBox.attemptParseFromJSON(bboxJson, ogcServiceProviderType);

        String filter = this.earthResourceService.getCommodityResourceViewFilter(name, commodityUri, jorcCategoryUri, bbox);
        response.setContentType("text/xml");
        OutputStream outputStream = response.getOutputStream();

        InputStream results = this.earthResourceDownloadService.downloadCommodityResourceView(serviceUrl, filter, maxFeatures, outputFormat);
        FileIOUtil.writeInputToOutputStream(results, outputStream, 8 * 1024, true);
        outputStream.close();
    }

}
