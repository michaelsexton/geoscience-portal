package au.gov.geoscience.portal.server.controllers;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.auscope.portal.core.services.PortalServiceException;
import org.auscope.portal.core.test.PortalTestClass;
import org.auscope.portal.server.web.service.NvclVocabService;
import org.jmock.Expectations;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.springframework.ui.ModelMap;
import org.springframework.web.servlet.ModelAndView;

import au.gov.geoscience.portal.services.vocabularies.CommodityVocabService;
import au.gov.geoscience.portal.services.vocabularies.GeologicTimescaleVocabService;
import au.gov.geoscience.portal.services.vocabularies.MineStatusVocabService;
import au.gov.geoscience.portal.services.vocabularies.ReserveCategoryVocabService;
import au.gov.geoscience.portal.services.vocabularies.ResourceCategoryVocabService;
import au.gov.geoscience.portal.services.vocabularies.VocabularyLookup;
import net.sf.json.JSONArray;

/**
 * Test Vocabulary Controller
 *
 */
public class TestVocabularyController extends PortalTestClass {

    private VocabularyController vocabularyController;

    private NvclVocabService mockNvclVocabService = context.mock(NvclVocabService.class);
    private CommodityVocabService mockCommodityVocabService = context.mock(CommodityVocabService.class);
    private ResourceCategoryVocabService mockResourceCategoryVocabService = context
            .mock(ResourceCategoryVocabService.class);
    private ReserveCategoryVocabService mockReserveCategoryVocabService = context
            .mock(ReserveCategoryVocabService.class);
    private GeologicTimescaleVocabService mockGeologicTimescaleVocabService = context
            .mock(GeologicTimescaleVocabService.class);
    private MineStatusVocabService mockMineStatusVocabService = context.mock(MineStatusVocabService.class);

    @Before
    public void setUp() {
        this.vocabularyController = new VocabularyController(mockNvclVocabService, mockCommodityVocabService,
                mockResourceCategoryVocabService, mockReserveCategoryVocabService, mockGeologicTimescaleVocabService,
                mockMineStatusVocabService);
    }

    /**
     * @throws Exception
     */
    @Test
    public void testGetScalarQuery() throws Exception {
        final String repository = "repo";
        final String label = "label";
        final List<String> defns = Arrays.asList("defn");

        context.checking(new Expectations() {
            {
                oneOf(mockNvclVocabService).getScalarDefinitionsByLabel(label);
                will(returnValue(defns));
            }
        });

        ModelAndView mav = vocabularyController.getScalarQuery(repository, label);
        Assert.assertNotNull(mav);
        Assert.assertTrue((Boolean) mav.getModel().get("success"));
        ModelMap data = (ModelMap) mav.getModel().get("data");
        Assert.assertNotNull(data);
        Assert.assertEquals(label, data.get("label"));
        Assert.assertEquals(defns.get(0), data.get("definition"));
        Assert.assertEquals(defns.get(0), data.get("scopeNote"));
    }

    @Test
    public void testGetScalarQueryError() throws Exception {
        final String repository = "repo";
        final String label = "label";

        context.checking(new Expectations() {
            {
                oneOf(mockNvclVocabService).getScalarDefinitionsByLabel(label);
                will(throwException(new PortalServiceException("")));
            }
        });

        ModelAndView mav = vocabularyController.getScalarQuery(repository, label);
        Assert.assertNotNull(mav);
        Assert.assertFalse((Boolean) mav.getModel().get("success"));
    }

    /**
     * @throws Exception
     */
    @Test
    public void testGetAllCommodities() throws Exception {
        final Map<String, String> serviceResult = new HashMap<String, String>();

        serviceResult.put("http://uri.org/1", "label1");
        serviceResult.put("http://uri.org/2", "label2");

        context.checking(new Expectations() {
            {
                oneOf(mockCommodityVocabService).getAllCommodityConcepts();
                will(returnValue(serviceResult));
            }
        });

        ModelAndView mav = vocabularyController.getAllCommodities();
        Assert.assertNotNull(mav);
        Assert.assertTrue((Boolean) mav.getModel().get("success"));

        JSONArray data = (JSONArray) mav.getModel().get("data");
        Assert.assertNotNull(data);
        Assert.assertEquals(serviceResult.size(), data.size());

        for (Object obj : data) {
            String urn = ((JSONArray) obj).getString(0);
            String label = ((JSONArray) obj).getString(1);

            Assert.assertEquals(serviceResult.get(urn), label);
            serviceResult.remove(urn);
        }

        Assert.assertEquals("Service result contains items that were NOT included in the JSON array response", 0,
                serviceResult.size());
    }

    /**
     * @throws Exception
     */
    @Test
    public void testGetAllCommoditiesError() throws Exception {
        context.checking(new Expectations() {
            {
                oneOf(mockCommodityVocabService).getAllCommodityConcepts();
                will(throwException(new PortalServiceException("")));
            }
        });

        ModelAndView mav = vocabularyController.getAllCommodities();
        Assert.assertNotNull(mav);
        Assert.assertFalse((Boolean) mav.getModel().get("success"));
    }

    /**
     * @throws Exception
     */
    @Test
    public void testGetAllMineStatuses() throws Exception {
        final Map<String, String> serviceResult = new HashMap<String, String>();

        serviceResult.put("http://uri.org/1", "label1");
        serviceResult.put("http://uri.org/2", "label2");

        context.checking(new Expectations() {
            {
                oneOf(mockMineStatusVocabService).getAllMineStatusConcepts();
                will(returnValue(serviceResult));
            }
        });

        ModelAndView mav = vocabularyController.getAllMineStatuses();
        Assert.assertNotNull(mav);
        Assert.assertTrue((Boolean) mav.getModel().get("success"));

        JSONArray data = (JSONArray) mav.getModel().get("data");
        Assert.assertNotNull(data);
        Assert.assertEquals(serviceResult.size(), data.size());

        // We want to make sure each of our map items are included in the list
        // We do this by removing items from serviceResult as they appear in the
        // response
        // Success will be measured by an empty serviceResult
        for (Object obj : data) {
            String urn = ((JSONArray) obj).getString(0);
            String label = ((JSONArray) obj).getString(1);

            Assert.assertEquals(serviceResult.get(urn), label);
            serviceResult.remove(urn);
        }

        Assert.assertEquals("Service result contains items that were NOT included in the JSON array response", 0,
                serviceResult.size());
    }

    /**
     * @throws Exception
     */
    @Test
    public void testGetAllMineStatusesError() throws Exception {
        context.checking(new Expectations() {
            {
                oneOf(mockMineStatusVocabService).getAllMineStatusConcepts();
                will(throwException(new PortalServiceException("")));
            }
        });

        ModelAndView mav = vocabularyController.getAllMineStatuses();
        Assert.assertNotNull(mav);
        Assert.assertFalse((Boolean) mav.getModel().get("success"));
    }

    /**
     * @throws Exception
     */
    @Test
    public void testGetAllJorcCategories() throws Exception {
        final Map<String, String> serviceResults = new HashMap<String, String>();
        final Map<String, String> serviceResult1 = new HashMap<String, String>();
        final Map<String, String> serviceResult2 = new HashMap<String, String>();

        serviceResult1.put("http://uri.org/1", "label1");

        serviceResult2.put("http://uri.org/2", "label2");

        serviceResults.putAll(serviceResult1);
        serviceResults.putAll(serviceResult2);

        serviceResults.put(VocabularyLookup.RESERVE_CATEGORY.uri(), "any reserves");
        serviceResults.put(VocabularyLookup.RESOURCE_CATEGORY.uri(), "any resources");

        context.checking(new Expectations() {
            {
                oneOf(mockReserveCategoryVocabService).getJorcReserveCategoryConcepts();
                will(returnValue(serviceResult1));
                oneOf(mockResourceCategoryVocabService).getJorcResourceCategoryConcepts();
                will(returnValue(serviceResult2));
            }
        });

        ModelAndView mav = vocabularyController.getAllJorcCategories();
        Assert.assertNotNull(mav);
        Assert.assertTrue((Boolean) mav.getModel().get("success"));

        JSONArray data = (JSONArray) mav.getModel().get("data");
        Assert.assertNotNull(data);
        Assert.assertEquals(serviceResults.size(), data.size());

        // We want to make sure each of our map items are included in the list
        // We do this by removing items from serviceResult as they appear in the
        // response
        // Success will be measured by an empty serviceResult
        for (Object obj : data) {
            String urn = ((JSONArray) obj).getString(0);
            String label = ((JSONArray) obj).getString(1);

            Assert.assertEquals(serviceResults.get(urn), label);
            serviceResults.remove(urn);
        }

        Assert.assertEquals("Service result contains items that were NOT included in the JSON array response", 0,
                serviceResults.size());
    }

    /**
     * @throws Exception
     */
    @Test
    public void testGetAllJorcCategoriesError() throws Exception {
        context.checking(new Expectations() {
            {
                oneOf(mockResourceCategoryVocabService).getJorcResourceCategoryConcepts();

                oneOf(mockReserveCategoryVocabService).getJorcReserveCategoryConcepts();
                will(throwException(new PortalServiceException("")));

            }
        });

        ModelAndView mav = vocabularyController.getAllJorcCategories();
        Assert.assertNotNull(mav);
        Assert.assertFalse((Boolean) mav.getModel().get("success"));
    }

    /**
     * @throws Exception
     */
    @Test
    public void testGetAllTimescales() throws Exception {
        final Map<String, String> serviceResult = new HashMap<String, String>();

        serviceResult.put("http://uri.org/1", "label1");
        serviceResult.put("http://uri.org/2", "label2");

        context.checking(new Expectations() {
            {
                oneOf(mockGeologicTimescaleVocabService).getAllTimescaleConcepts();
                will(returnValue(serviceResult));
            }
        });

        ModelAndView mav = vocabularyController.getAllTimescales();
        Assert.assertNotNull(mav);
        Assert.assertTrue((Boolean) mav.getModel().get("success"));

        JSONArray data = (JSONArray) mav.getModel().get("data");
        Assert.assertNotNull(data);
        Assert.assertEquals(serviceResult.size(), data.size());

        // We want to make sure each of our map items are included in the list
        // We do this by removing items from serviceResult as they appear in the
        // response
        // Success will be measured by an empty serviceResult
        for (Object obj : data) {
            String urn = ((JSONArray) obj).getString(0);
            String label = ((JSONArray) obj).getString(1);

            Assert.assertEquals(serviceResult.get(urn), label);
            serviceResult.remove(urn);
        }

        Assert.assertEquals("Service result contains items that were NOT included in the JSON array response", 0,
                serviceResult.size());
    }

    /**
     * @throws Exception
     */
    @Test
    public void testGetAllTimescalesError() throws Exception {
        context.checking(new Expectations() {
            {
                oneOf(mockGeologicTimescaleVocabService).getAllTimescaleConcepts();
                will(throwException(new PortalServiceException("")));
            }
        });

        ModelAndView mav = vocabularyController.getAllTimescales();
        Assert.assertNotNull(mav);
        Assert.assertFalse((Boolean) mav.getModel().get("success"));
    }

}
