<?xml version="1.0" encoding="ISO-8859-1"?>
<StyledLayerDescriptor version="1.0.0" xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <NamedLayer>
        <Name>ga_rock_properties_wms:bulk_density_cluster</Name>
        <UserStyle>
            <!-- Styles can have names, titles and abstracts -->
            <Title>Stacked Point</Title>
            <Abstract>Styles Bulk Density using stacked points</Abstract>
            <FeatureTypeStyle>
                <Transformation>
                    <ogc:Function name="vec:PointStacker">
                        <ogc:Function name="parameter">
                            <ogc:Literal>data</ogc:Literal>
                        </ogc:Function>
                        <ogc:Function name="parameter">
                            <ogc:Literal>cellSize</ogc:Literal>
                            <ogc:Literal>75</ogc:Literal>
                        </ogc:Function>
                        <ogc:Function name="parameter">
                            <ogc:Literal>outputBBOX</ogc:Literal>
                            <ogc:Function name="env">
                                <ogc:Literal>wms_bbox</ogc:Literal>
                            </ogc:Function>
                        </ogc:Function>
                        <ogc:Function name="parameter">
                            <ogc:Literal>outputWidth</ogc:Literal>
                            <ogc:Function name="env">
                                <ogc:Literal>wms_width</ogc:Literal>
                            </ogc:Function>
                        </ogc:Function>
                        <ogc:Function name="parameter">
                            <ogc:Literal>outputHeight</ogc:Literal>
                            <ogc:Function name="env">
                                <ogc:Literal>wms_height</ogc:Literal>
                            </ogc:Function>
                        </ogc:Function>
                    </ogc:Function>
                </Transformation>
                <Rule>
                    <Name>feature</Name>
                    <Title>Bulk Density</Title>
                    <ogc:Filter>
                        <ogc:PropertyIsLessThanOrEqualTo>
                            <ogc:PropertyName>count</ogc:PropertyName>
                            <ogc:Literal>1</ogc:Literal>
                        </ogc:PropertyIsLessThanOrEqualTo>
                    </ogc:Filter>
                    <PointSymbolizer>
                        <Graphic>
                            <Mark>
                                <WellKnownName>circle</WellKnownName>
                                <Fill>
                                    <CssParameter name="fill">#fff300</CssParameter>
                                </Fill>
                                <Stroke>
                                    <CssParameter name="stroke">#000000</CssParameter>
                                    <CssParameter name="stroke-width">0.2</CssParameter>
                                </Stroke>
                            </Mark>
                            <Size>10</Size>
                        </Graphic>
                    </PointSymbolizer>
                </Rule>
                <Rule>
                    <Name>cluster_lt_1000</Name>
                    <Title>Bulk Density Cluster &lt; 1000</Title>
                    <ogc:Filter>
                        <ogc:PropertyIsBetween>
                            <ogc:PropertyName>count</ogc:PropertyName>
                            <ogc:LowerBoundary>
                                <ogc:Literal>2</ogc:Literal>
                            </ogc:LowerBoundary>
                            <ogc:UpperBoundary>
                                <ogc:Literal>1000</ogc:Literal>
                            </ogc:UpperBoundary>
                        </ogc:PropertyIsBetween>
                    </ogc:Filter>
                    <PointSymbolizer>
                        <Graphic>
                            <Mark>
                                <WellKnownName>circle</WellKnownName>
                                <Fill>
                                    <CssParameter name="fill">#fff300</CssParameter>
                                    <CssParameter name="fill-opacity">0.9</CssParameter>
                                </Fill>
                                <Stroke>
                                    <CssParameter name="stroke">#fff300</CssParameter>
                                    <CssParameter name="stroke-width">6</CssParameter>
                                    <CssParameter name="stroke-opacity">0.5</CssParameter>
                                </Stroke>
                            </Mark>
                            <Size>22</Size>
                        </Graphic>
                    </PointSymbolizer>
                    <TextSymbolizer>
                        <Label>
                            <ogc:PropertyName>count</ogc:PropertyName>
                        </Label>
                        <Font>
                            <CssParameter name="font-family">SansSerif</CssParameter>
                            <CssParameter name="font-size">10</CssParameter>
                            <CssParameter name="font-weight">bold</CssParameter>
                        </Font>
                        <LabelPlacement>
                            <PointPlacement>
                                <AnchorPoint>
                                    <AnchorPointX>0.5</AnchorPointX>
                                    <AnchorPointY>0.8</AnchorPointY>
                                </AnchorPoint>
                            </PointPlacement>
                        </LabelPlacement>
                        <Halo>
                            <Radius>1</Radius>
                            <Fill>
                                <CssParameter name="fill">#000000</CssParameter>
                                <CssParameter name="fill-opacity">0.6</CssParameter>
                            </Fill>
                        </Halo>
                        <Fill>
                            <CssParameter name="fill">#FFFFFF</CssParameter>
                            <CssParameter name="fill-opacity">1.0</CssParameter>
                        </Fill>
                        <VendorOption name="partials">true</VendorOption>
                    </TextSymbolizer>
                </Rule>
                <Rule>
                    <Name>cluster_lt_100000</Name>
                    <Title>Bulk Density Cluster &lt; 100000</Title>
                    <ogc:Filter>
                        <ogc:PropertyIsBetween>
                            <ogc:PropertyName>count</ogc:PropertyName>
                            <ogc:LowerBoundary>
                                <ogc:Literal>1000</ogc:Literal>
                            </ogc:LowerBoundary>
                            <ogc:UpperBoundary>
                                <ogc:Literal>100000</ogc:Literal>
                            </ogc:UpperBoundary>
                        </ogc:PropertyIsBetween>
                    </ogc:Filter>
                    <PointSymbolizer>
                        <Graphic>
                            <Mark>
                                <WellKnownName>circle</WellKnownName>
                                <Fill>
                                    <CssParameter name="fill">#fff300</CssParameter>
                                    <CssParameter name="fill-opacity">0.9</CssParameter>
                                </Fill>
                                <Stroke>
                                    <CssParameter name="stroke">#fff300</CssParameter>
                                    <CssParameter name="stroke-width">8</CssParameter>
                                    <CssParameter name="stroke-opacity">0.5</CssParameter>
                                </Stroke>
                            </Mark>
                            <Size>34</Size>
                        </Graphic>
                    </PointSymbolizer>
                    <TextSymbolizer>
                        <Label>
                            <ogc:PropertyName>count</ogc:PropertyName>
                        </Label>
                        <Font>
                            <CssParameter name="font-family">SansSerif</CssParameter>
                            <CssParameter name="font-size">10</CssParameter>
                            <CssParameter name="font-weight">bold</CssParameter>
                        </Font>
                        <LabelPlacement>
                            <PointPlacement>
                                <AnchorPoint>
                                    <AnchorPointX>0.5</AnchorPointX>
                                    <AnchorPointY>0.8</AnchorPointY>
                                </AnchorPoint>
                            </PointPlacement>
                        </LabelPlacement>
                        <Halo>
                            <Radius>1</Radius>
                            <Fill>
                                <CssParameter name="fill">#000000</CssParameter>
                                <CssParameter name="fill-opacity">0.6</CssParameter>
                            </Fill>
                        </Halo>
                        <Fill>
                            <CssParameter name="fill">#FFFFFF</CssParameter>
                            <CssParameter name="fill-opacity">1.0</CssParameter>
                        </Fill>
                        <VendorOption name="partials">true</VendorOption>
                    </TextSymbolizer>
                </Rule>
                <Rule>
                    <Name>cluster_gt_99999</Name>
                    <Title>Bulk Density Cluster &gt; 100000</Title>
                    <ogc:Filter>
                        <ogc:PropertyIsGreaterThan>
                            <ogc:PropertyName>count</ogc:PropertyName>
                            <ogc:Literal>100000</ogc:Literal>
                        </ogc:PropertyIsGreaterThan>
                    </ogc:Filter>
                    <PointSymbolizer>
                        <Graphic>
                            <Mark>
                                <WellKnownName>circle</WellKnownName>
                                <Fill>
                                    <CssParameter name="fill">#fff300</CssParameter>
                                    <CssParameter name="fill-opacity">0.9</CssParameter>
                                </Fill>
                                <Stroke>
                                    <CssParameter name="stroke">#fff300</CssParameter>
                                    <CssParameter name="stroke-width">10</CssParameter>
                                    <CssParameter name="stroke-opacity">0.5</CssParameter>
                                </Stroke>
                            </Mark>
                            <Size>40</Size>
                        </Graphic>
                    </PointSymbolizer>
                    <TextSymbolizer>
                        <Label>
                            <ogc:PropertyName>count</ogc:PropertyName>
                        </Label>
                        <Font>
                            <CssParameter name="font-family">SansSerif</CssParameter>
                            <CssParameter name="font-size">10</CssParameter>
                            <CssParameter name="font-weight">bold</CssParameter>
                        </Font>
                        <LabelPlacement>
                            <PointPlacement>
                                <AnchorPoint>
                                    <AnchorPointX>0.5</AnchorPointX>
                                    <AnchorPointY>0.8</AnchorPointY>
                                </AnchorPoint>
                            </PointPlacement>
                        </LabelPlacement>
                        <Halo>
                            <Radius>1</Radius>
                            <Fill>
                                <CssParameter name="fill">#000000</CssParameter>
                                <CssParameter name="fill-opacity">0.6</CssParameter>
                            </Fill>
                        </Halo>
                        <Fill>
                            <CssParameter name="fill">#FFFFFF</CssParameter>
                            <CssParameter name="fill-opacity">1.0</CssParameter>
                        </Fill>
                        <VendorOption name="partials">true</VendorOption>
                    </TextSymbolizer>
                </Rule>
            </FeatureTypeStyle>
        </UserStyle>
    </NamedLayer>
</StyledLayerDescriptor>