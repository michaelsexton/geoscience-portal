<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns="http://www.opengis.net/kml/2.2"
    xmlns:er="urn:cgi:xmlns:GGIC:EarthResource:1.1" xmlns:geodesy="http://www.auscope.org/geodesy"
    xmlns:gml="http://www.opengis.net/gml" xmlns:gsml="urn:cgi:xmlns:CGI:GeoSciML:2.0"
    xmlns:ngcp="http://www.auscope.org/ngcp" xmlns:sa="http://www.opengis.net/sampling/1.0"
    xmlns:wfs="http://www.opengis.net/wfs" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    xmlns:mt="http://xmlns.geoscience.gov.au/mineraltenementml/1.0"
    exclude-result-prefixes="er geodesy gml gsml mt ngcp sa wfs xsl xlink">
    <xsl:output method="text" encoding="utf-8"/>
    <xsl:strip-space elements="*"/>

    <xsl:variable name="CRLF">
        <xsl:text>&#13;&#10;</xsl:text>
    </xsl:variable>
    <xsl:variable name="CR">
        <xsl:text>&#13;</xsl:text>
    </xsl:variable>
    <xsl:variable name="LF">
        <xsl:text>&#10;</xsl:text>
    </xsl:variable>
    <xsl:variable name="apos">'</xsl:variable>

    <xsl:template match="/wfs:FeatureCollection/gml:boundedBy"></xsl:template>

    <xsl:template match="/wfs:FeatureCollection/gml:featureMember">
        <xsl:for-each select="mt:MineralTenement[1]/*">
            <xsl:value-of select="name()"/>
            <xsl:if test="position() != last()">,</xsl:if>
        </xsl:for-each>
        <xsl:value-of select="$LF"/>
        <xsl:apply-templates/>
    </xsl:template>

    <xsl:template match="mt:MineralTenement">
        <xsl:apply-templates/>
        <xsl:value-of select="$LF"/>
    </xsl:template>

    <xsl:template match="mt:MineralTenement/*">
        <xsl:choose>
            <xsl:when
                test="contains(text(), ',') or contains(text(), $apos) or contains(text(), $CRLF) or contains(text(), $CR) or contains(text(), $LF)">
                <xsl:text>&quot;</xsl:text>
                <xsl:call-template name="doublequotes">
                    <xsl:with-param name="text" select="text()"/>
                </xsl:call-template>
                <xsl:text>&quot;</xsl:text>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="."/>
            </xsl:otherwise>
        </xsl:choose>
        <xsl:if test="position() != last()">,</xsl:if>
    </xsl:template>

    <xsl:template name="doublequotes">
        <xsl:param name="text"/>
        <xsl:choose>
            <xsl:when test="contains($text, '&quot;')">
                <!-- recursive call -->
                <xsl:value-of select="concat(substring-before($text, '&quot;'), '&quot;&quot;')"/>
                <xsl:call-template name="doublequotes">
                    <xsl:with-param name="text" select="substring-after($text, '&quot;')"/>
                </xsl:call-template>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="$text"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
</xsl:stylesheet>
