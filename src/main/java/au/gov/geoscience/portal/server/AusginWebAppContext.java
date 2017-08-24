package au.gov.geoscience.portal.server;

import java.util.Arrays;

import org.auscope.portal.core.server.PortalProfileXmlWebApplicationContext;

public class AusginWebAppContext extends PortalProfileXmlWebApplicationContext {
    @Override
    protected String[] getDefaultConfigLocations() {
        String[] locations = super.getDefaultConfigLocations();

        //VT --perform some initalizing sequence. Could not find a more suitable place for this
        Initializer init = new Initializer();
        init.run();
        //--  end of initialization

        String[] ausginLocations = Arrays.copyOf(locations, locations.length + 3);
        ausginLocations[ausginLocations.length - 1] = DEFAULT_CONFIG_LOCATION_PREFIX + "ausgin-known-layers.xml";
        ausginLocations[ausginLocations.length - 2] = DEFAULT_CONFIG_LOCATION_PREFIX + "ausgin-registries.xml";
        ausginLocations[ausginLocations.length - 3] = DEFAULT_CONFIG_LOCATION_PREFIX + "service-level-config.xml";

        return ausginLocations;
    }
}
