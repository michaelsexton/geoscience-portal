package au.gov.geoscience.portal.config;

import au.gov.geoscience.portal.server.controllers.sessionobject.StringArrayToCustomRegistry;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

@Configuration
@EnableWebMvc
@ComponentScan(basePackages = "org.auscope.portal")
public class Dispatcher extends WebMvcConfigurerAdapter {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**").allowedMethods("GET", "POST").allowedOrigins("*");
    }


    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(new StringArrayToCustomRegistry());
    }
}
