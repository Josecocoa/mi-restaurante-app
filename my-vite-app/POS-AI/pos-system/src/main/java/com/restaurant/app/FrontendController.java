package com.restaurant.app.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class FrontendController {
    @RequestMapping(value = "/{[path:[^\\.]*}")
    public String redirect() {
        // Redirige a index.html para que React maneje el enrutamiento
        return "forward:/index.html";
    }
}
