package au.gov.geoscience.portal.uifilter;

public class UIFilterDate extends AbstractParameterFilter {

    private static final String TYPE = "OPTIONAL.DATE";

    public UIFilterDate(String label, String value, String parameterName){
        this.setLabel(label);
        this.setValue(value);
        this.setParameterName(parameterName);

    }

    @Override
    public String getType() {
        return TYPE;
    }
}
