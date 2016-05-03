package org.auscope.portal.server.web.service;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.Header;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpRequestBase;
import org.auscope.portal.core.server.http.HttpServiceCaller;
import org.auscope.portal.core.util.DOMUtil;
import org.auscope.portal.server.domain.nvcldataservice.AlgorithmOutputClassification;
import org.auscope.portal.server.domain.nvcldataservice.AlgorithmOutputResponse;
import org.auscope.portal.server.domain.nvcldataservice.AlgorithmVersion;
import org.auscope.portal.server.domain.nvcldataservice.BinnedCSVResponse;
import org.auscope.portal.server.domain.nvcldataservice.BinnedCSVResponse.Bin;
import org.auscope.portal.server.domain.nvcldataservice.CSVDownloadResponse;
import org.auscope.portal.server.domain.nvcldataservice.GetLogCollectionResponse;
import org.auscope.portal.server.domain.nvcldataservice.MosaicResponse;
import org.auscope.portal.server.domain.nvcldataservice.TrayThumbNailResponse;
import org.auscope.portal.server.web.NVCL2_0_DataServiceMethodMaker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

@Service
public class NVCL2_0_DataService {

    private final Log log = LogFactory.getLog(getClass());
    private NVCL2_0_DataServiceMethodMaker nvclMethodMaker;
    private HttpServiceCaller httpServiceCaller;

    @Autowired
    public NVCL2_0_DataService(HttpServiceCaller httpServiceCaller,
            NVCL2_0_DataServiceMethodMaker nvclMethodMaker) {
        this.nvclMethodMaker = nvclMethodMaker;
        this.httpServiceCaller = httpServiceCaller;
    }

    /**
     * Makes a CSV download request from NVCL 2.0 service and returns the resulting data in a CSVDownloadResponse
     *
     * Response should be a stream of bytes for a CSV file
     *
     * @param serviceUrl
     *            The URL of an observation and measurements URL (obtained from a getDatasetCollection response)
     * @param datasetId
     *            The dataset to download
     * @return
     * @throws Exception
     */

    public CSVDownloadResponse getNVCL2_0_CSVDownload(String serviceUrl, String[] logIds) throws Exception {

        serviceUrl += "downloadscalars.html";

        HttpRequestBase method = nvclMethodMaker.getDownloadCSVMethod(serviceUrl, logIds);
        HttpResponse httpResponse = httpServiceCaller.getMethodResponseAsHttpResponse(method);
        InputStream responseStream = httpResponse.getEntity().getContent();
        Header contentHeader = httpResponse.getEntity().getContentType();

        return new CSVDownloadResponse(responseStream, contentHeader == null ? null : contentHeader.getValue());
    }

    public TrayThumbNailResponse getTrayThumbNail(String dataSetId, String serviceUrl, String logId,
            Integer width, Integer startSampleNo, Integer endSampleNo) throws Exception {

        HttpRequestBase method = nvclMethodMaker.getTrayThumbNailMethodMaker(dataSetId, serviceUrl, logId, width,
                startSampleNo, endSampleNo);
        HttpResponse httpResponse = httpServiceCaller.getMethodResponseAsHttpResponse(method);
        InputStream responseStream = httpResponse.getEntity().getContent();
        Header contentHeader = httpResponse.getEntity().getContentType();

        return new TrayThumbNailResponse(responseStream, contentHeader == null ? null : contentHeader.getValue());

    }

    /**
     * Makes and parses a getLogCollection request to a NVCLDataService
     * 
     * @param serviceUrl
     *            The NVCLDataService url
     * @param datasetId
     *            The unique dataset ID to query
     * @param forMosaicService
     *            [Optional] indicates if the getLogCollection service should generate a result specifically for the use of a Mosaic Service
     * @throws Exception
     */
    public List<GetLogCollectionResponse> getLogCollection(String serviceUrl, String datasetId, Boolean forMosaicService)
            throws Exception {
        HttpRequestBase method = nvclMethodMaker.getLogCollectionMethod(serviceUrl, datasetId, forMosaicService);

        //Make our request, parse it into a DOM document
        InputStream responseStream = httpServiceCaller.getMethodResponseAsStream(method);
        Document responseDoc = DOMUtil.buildDomFromStream(responseStream);

        //Get our dataset nodes
        XPathExpression expr = DOMUtil.compileXPathExpr("LogCollection/Log");
        NodeList nodeList = (NodeList) expr.evaluate(responseDoc, XPathConstants.NODESET);

        //Parse our response objects
        List<GetLogCollectionResponse> responseObjs = new ArrayList<GetLogCollectionResponse>();
        XPathExpression exprLogId = DOMUtil.compileXPathExpr("LogID");
        XPathExpression exprLogName = DOMUtil.compileXPathExpr("LogName");
        XPathExpression exprSampleCount = DOMUtil.compileXPathExpr("SampleCount");

        for (int i = 0; i < nodeList.getLength(); i++) {
            Node node = nodeList.item(i);

            String logId = (String) exprLogId.evaluate(node, XPathConstants.STRING);
            String logName = (String) exprLogName.evaluate(node, XPathConstants.STRING);
            String sampleCountString = (String) exprSampleCount.evaluate(node, XPathConstants.STRING);
            int sampleCount = 0;
            if (sampleCountString != null && !sampleCountString.isEmpty()) {
                sampleCount = Integer.parseInt(sampleCountString);
            }

            responseObjs.add(new GetLogCollectionResponse(logId, logName, sampleCount));
        }

        return responseObjs;
    }

    /**
     * Makes and parses an NVCL getAlgorithms request.
     * @param serviceUrl
     * @return
     */
    public List<AlgorithmOutputResponse> getAlgorithms(String serviceUrl) throws Exception {
        HttpRequestBase method = nvclMethodMaker.getAlgorithms(serviceUrl);
        String responseText = httpServiceCaller.getMethodResponseAsString(method);
        Document responseDoc = DOMUtil.buildDomFromString(responseText, false);

        XPathExpression expr = DOMUtil.compileXPathExpr("Algorithms/algorithms");
        XPathExpression exprOutputs = DOMUtil.compileXPathExpr("outputs");
        XPathExpression exprVersions = DOMUtil.compileXPathExpr("versions");
        XPathExpression exprVersion = DOMUtil.compileXPathExpr("version");
        XPathExpression exprAlgorithmOutputId = DOMUtil.compileXPathExpr("algorithmoutputID");
        NodeList algorithmNodeList = (NodeList) expr.evaluate(responseDoc, XPathConstants.NODESET);

        XPathExpression exprAlgorithmId = DOMUtil.compileXPathExpr("algorithmID");
        XPathExpression exprName = DOMUtil.compileXPathExpr("name");

        ArrayList<AlgorithmOutputResponse> responseObjs = new ArrayList<AlgorithmOutputResponse>();

        for (int i = 0; i < algorithmNodeList.getLength(); i++) {
            Node node = algorithmNodeList.item(i);

            int algorithmId = Integer.parseInt((String) exprAlgorithmId.evaluate(node, XPathConstants.STRING));
            String algorithmName = (String) exprName.evaluate(node, XPathConstants.STRING);

            NodeList outputNodeList = (NodeList) exprOutputs.evaluate(node, XPathConstants.NODESET);
            for (int j = 0; j < outputNodeList.getLength(); j++) {
                Node outputNode = outputNodeList.item(j);
                String outputName = (String) exprName.evaluate(outputNode, XPathConstants.STRING);

                NodeList versionNodeList = (NodeList) exprVersions.evaluate(outputNode, XPathConstants.NODESET);
                ArrayList<AlgorithmVersion> versions = new ArrayList<AlgorithmVersion>(versionNodeList.getLength());
                for (int k = 0; k < versionNodeList.getLength(); k++) {
                    Node versionNode = versionNodeList.item(k);

                    int versionId = Integer.parseInt((String) exprVersion.evaluate(versionNode, XPathConstants.STRING));
                    int algorithmOutputId = Integer.parseInt((String) exprAlgorithmOutputId.evaluate(versionNode, XPathConstants.STRING));

                    versions.add(new AlgorithmVersion(algorithmOutputId, versionId));
                }

                responseObjs.add(new AlgorithmOutputResponse(algorithmId, algorithmName, outputName, versions));
            }
        }

        return responseObjs;
    }

    /**
     * Makes and parses a getClassifications request
     * @param serviceUrl
     * @param algorithmOutputId
     * @return
     * @throws Exception
     */
    public List<AlgorithmOutputClassification> getClassifications(String serviceUrl, int algorithmOutputId) throws Exception {
        HttpRequestBase method = nvclMethodMaker.getClassifications(serviceUrl, algorithmOutputId);
        String responseText = httpServiceCaller.getMethodResponseAsString(method);
        Document responseDoc = DOMUtil.buildDomFromString(responseText, false);

        XPathExpression exprNodes = DOMUtil.compileXPathExpr("ClassificationsCollection/classifications");
        XPathExpression exprClassText = DOMUtil.compileXPathExpr("classText");
        XPathExpression exprColor = DOMUtil.compileXPathExpr("colour");
        XPathExpression exprIndex = DOMUtil.compileXPathExpr("index");

        NodeList classNodeList = (NodeList) exprNodes.evaluate(responseDoc, XPathConstants.NODESET);
        ArrayList<AlgorithmOutputClassification> responseObjs = new ArrayList<AlgorithmOutputClassification>(classNodeList.getLength());
        for (int i = 0; i < classNodeList.getLength(); i++) {
            Node classNode = classNodeList.item(i);

            String classText = (String) exprClassText.evaluate(classNode, XPathConstants.STRING);
            int color = Integer.parseInt((String) exprColor.evaluate(classNode, XPathConstants.STRING));
            int index = Integer.parseInt((String) exprIndex.evaluate(classNode, XPathConstants.STRING));

            responseObjs.add(new AlgorithmOutputClassification(classText, color, index));
        }

        return responseObjs;
    }


}
