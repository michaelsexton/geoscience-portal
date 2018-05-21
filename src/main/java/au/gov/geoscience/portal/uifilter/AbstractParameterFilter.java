package au.gov.geoscience.portal.uifilter;

import org.auscope.portal.core.uifilter.AbstractBaseFilter;

public abstract class AbstractParameterFilter extends AbstractBaseFilter{

    private String parameterName;

    public String getParameterName() {
        return parameterName;
    }

    public void setParameterName(String parameterName) {
        this.parameterName = parameterName;
    }
}
