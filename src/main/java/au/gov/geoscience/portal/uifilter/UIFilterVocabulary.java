package au.gov.geoscience.portal.uifilter;

public class UIFilterVocabulary extends AbstractParameterFilter {

    private static final String TYPE = "OPTIONAL.VOCABULARY";

    private String url;


    public UIFilterVocabulary(String label, String value, String parameterName, String url){
        this.setLabel(label);
        this.setValue(value);
        this.setParameterName(parameterName);

        this.url = url;

    }

    @Override
    public String getType() {
        return TYPE;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}
