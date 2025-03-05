package com.restaurant.app;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class PedidoWebSocketController {

    // Este método se invoca cuando un cliente envía un mensaje a "/app/nuevo-pedido"
    @MessageMapping("/nuevo-pedido")
    // El mensaje se enviará a todos los clientes suscritos a "/topic/pedidos"
    @SendTo("/topic/pedidos")
    public String nuevoPedido(String mensaje) throws Exception {
        // Aquí podrías añadir lógica, por ejemplo, guardar el pedido en la base de datos.
        // Por ahora, simplemente retornamos el mensaje recibido.
        return mensaje;
    }
}
