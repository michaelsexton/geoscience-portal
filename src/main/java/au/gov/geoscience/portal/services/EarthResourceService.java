package au.gov.geoscience.portal.services;

import java.net.URISyntaxException;

import org.apache.http.client.methods.HttpRequestBase;
import org.auscope.portal.core.server.http.HttpServiceCaller;
import org.auscope.portal.core.services.BaseWFSService;
import org.auscope.portal.core.services.PortalServiceException;
import org.auscope.portal.core.services.methodmakers.WFSGetFeatureMethodMaker;
import org.auscope.portal.core.services.methodmakers.WFSGetFeatureMethodMaker.ResultType;
import org.auscope.portal.core.services.methodmakers.filter.FilterBoundingBox;
import org.auscope.portal.core.services.methodmakers.filter.IFilter;
import org.auscope.portal.core.services.responses.wfs.WFSCountResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import au.gov.geoscience.portal.services.methodmaker.filter.CommodityResourceViewFilter;
import au.gov.geoscience.portal.services.methodmaker.filter.MineFilter;
import au.gov.geoscience.portal.services.methodmaker.filter.MineViewFilter;
import au.gov.geoscience.portal.services.methodmaker.filter.MineralOccurrenceViewFilter;

@Service
public class EarthResourceService extends BaseWFSService {

    public static final String MINING_FEATURE_OCCURRENCE_FEATURE_TYPE = "er:MiningFeatureOccurrence";
    public static final String MINE_FEATURE_TYPE = "er:Mine";

    public static final String MINERAL_OCCURRENCE_VIEW_FEATURE_TYPE = "erl:MineralOccurrenceView";
    public static final String MINE_VIEW_FEATURE_TYPE = "erl:MineView";
    public static final String COMMODITY_RESOURCE_VIEW_FEATURE_TYPE = "erl:CommodityResourceView";

    @Autowired
    public EarthResourceService(HttpServiceCaller httpServiceCaller, WFSGetFeatureMethodMaker wfsMethodMaker) {
        super(httpServiceCaller, wfsMethodMaker);

    }

    public String getMineFilter(String mineName, String status, FilterBoundingBox bbox) {
        MineFilter filter = new MineFilter(mineName, status);
        return generateFilterString(filter, bbox);
    }

    public WFSCountResponse getMineCount(String serviceUrl, String mineName, String status, FilterBoundingBox bbox,
            int maxFeatures) throws URISyntaxException, PortalServiceException {
        MineFilter filter = new MineFilter(mineName, status);
        String filterString = generateFilterString(filter, bbox);
        HttpRequestBase method = generateWFSRequest(serviceUrl, MINING_FEATURE_OCCURRENCE_FEATURE_TYPE, null,
                filterString, maxFeatures, null, ResultType.Hits);
        return getWfsFeatureCount(method);
    }

    public WFSCountResponse getMineralOccurrenceViewCount(String serviceUrl, String name, String commodityUri,
            String timescaleUri, FilterBoundingBox bbox, int maxFeatures)
            throws URISyntaxException, PortalServiceException {

        MineralOccurrenceViewFilter filter = new MineralOccurrenceViewFilter(name, commodityUri, timescaleUri);
        String filterString = generateFilterString(filter, bbox);
        HttpRequestBase method = generateWFSRequest(serviceUrl, MINERAL_OCCURRENCE_VIEW_FEATURE_TYPE, null,
                filterString, maxFeatures, null, ResultType.Hits);

        return getWfsFeatureCount(method);
    }

    public WFSCountResponse getMineViewCount(String serviceUrl, String name, String statusUri, FilterBoundingBox bbox,
            int maxFeatures) throws URISyntaxException, PortalServiceException {

        MineViewFilter filter = new MineViewFilter(name, statusUri);
        String filterString = generateFilterString(filter, bbox);
        HttpRequestBase method = generateWFSRequest(serviceUrl, MINE_VIEW_FEATURE_TYPE, null, filterString, maxFeatures,
                null, ResultType.Hits);

        return getWfsFeatureCount(method);

    }

    public WFSCountResponse getCommodityResourceViewCount(String serviceUrl, String mineralOccurrenceName,
            String commodityUri, String jorcCategoryUri, FilterBoundingBox bbox, int maxFeatures)
            throws URISyntaxException, PortalServiceException {

        CommodityResourceViewFilter filter = new CommodityResourceViewFilter(mineralOccurrenceName, commodityUri,
                jorcCategoryUri);
        String filterString = generateFilterString(filter, bbox);
        HttpRequestBase method = generateWFSRequest(serviceUrl, COMMODITY_RESOURCE_VIEW_FEATURE_TYPE, null,
                filterString, maxFeatures, null, ResultType.Hits);

        return getWfsFeatureCount(method);
    }

    public static String generateFilterString(IFilter filter, FilterBoundingBox bbox) {
        String filterString = null;
        if (bbox == null) {
            filterString = filter.getFilterStringAllRecords();
        } else {
            filterString = filter.getFilterStringBoundingBox(bbox);
        }

        return filterString;
    }

    public String getMineralOccurrenceViewFilter(String name, String commodityUri, String timescaleUri,
            FilterBoundingBox bbox) {
        MineralOccurrenceViewFilter filter = new MineralOccurrenceViewFilter(name, commodityUri, timescaleUri);

        return generateFilterString(filter, bbox);

    }

    public String getMineViewFilter(String name, String statusUri, FilterBoundingBox bbox) {
        MineViewFilter filter = new MineViewFilter(name, statusUri);

        return generateFilterString(filter, bbox);

    }

    public String getCommodityResourceViewFilter(String name, String commodityUri, String jorcCategoryUri,
            FilterBoundingBox bbox) {

        CommodityResourceViewFilter filter = new CommodityResourceViewFilter(name, commodityUri, jorcCategoryUri);
        return generateFilterString(filter, bbox);
    }

}
