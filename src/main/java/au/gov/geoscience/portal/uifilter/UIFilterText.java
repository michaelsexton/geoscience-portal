package au.gov.geoscience.portal.uifilter;

import org.auscope.portal.core.uifilter.AbstractBaseFilter;

public class UIFilterText extends AbstractParameterFilter{

    private static final String TYPE = "OPTIONAL.TEXT";

    public UIFilterText(String label, String value, String parameterName){
        this.setLabel(label);
        this.setValue(value);
        this.setParameterName(parameterName);

    }

    @Override
    public String getType() {
        return TYPE;
    }
}
