package au.gov.geoscience.portal.services;

import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.List;

import org.auscope.portal.core.server.http.HttpClientInputStream;
import org.auscope.portal.core.server.http.HttpServiceCaller;
import org.auscope.portal.core.services.methodmakers.WMSMethodMakerInterface;
import org.auscope.portal.core.services.responses.csw.CSWRecord;
import org.auscope.portal.core.test.PortalTestClass;
import org.auscope.portal.core.test.ResourceUtil;
import org.jmock.Expectations;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

/**
 * Unit tests for GetCapabilitiesService
 *
 * @author Josh Vote
 *
 */
public class TestSeismicSurveyService extends PortalTestClass {

    private SeismicSurveyService service;
    private HttpServiceCaller mockServiceCaller;

    @Before
    public void setup() throws Exception {
        List<WMSMethodMakerInterface> methodMaker = new ArrayList<WMSMethodMakerInterface>();
        mockServiceCaller = context.mock(HttpServiceCaller.class);
        service = new SeismicSurveyService(mockServiceCaller);
    }

    /**
     * Test that the function is able to actually load CSW records from multiple services
     *
     * @throws Exception
     */
    @Test
    public void testGetCSWRecord() throws Exception {
        final String docString = ResourceUtil
                .loadResourceAsString("au/gov/geoscience/portal/services/SeismicSurvey.xml");
        final ByteArrayInputStream is1 = new ByteArrayInputStream(docString.getBytes());
        final String mockUrl = "http://example";

        context.checking(new Expectations() {
            {

                oneOf(mockServiceCaller).getMethodResponseAsStream(with(aHttpMethodBase(null, mockUrl, null)));
                will(returnValue(new HttpClientInputStream(is1, null)));
            }
        });

        CSWRecord record = service.getCSWRecord(mockUrl);
        Assert.assertEquals("Canberra", record.getContact().getContactInfo().getAddressCity());
        Assert.assertEquals("ACT", record.getContact().getContactInfo().getAddressAdministrativeArea());
        Assert.assertEquals("ce415703-fb0a-1a1c-e044-00144fdd4fa6", record.getFileIdentifier());
        Assert.assertEquals(1, record.getOnlineResources().length);

    }

}
