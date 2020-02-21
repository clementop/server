import { world } from '@server/game-server';
import { Player } from '@server/world/mob/player/player';
import { logger } from '@runejs/logger/dist/logger';
import { Shop } from '@server/world/config/shops';
import { widgetIds } from '@server/world/mob/player/widget';

function findShop(identification: string): Shop {
    for(let i = 0; i <= world.shops.length; i++) {
        if(world.shops[i].identification === identification) return world.shops[i];
    }
    return undefined;
}

export function openShop(player: Player, identification: string, closeOnWalk: boolean = true): void {
    try {
        const openedShop = findShop(identification);
        if(openedShop === undefined) {
            throw `Unable to find the shop with identification of: ${identification}`;
        }
        player.packetSender.updateWidgetString(widgetIds.shop.shopTitle, openedShop.name);
        for(let i = 0; i < 30; i++) {
            if(openedShop.items.length <= i) {
                player.packetSender.sendUpdateSingleWidgetItem(widgetIds.shop.shopInventory, i, null);
            } else {
                player.packetSender.sendUpdateSingleWidgetItem(widgetIds.shop.shopInventory, i, {
                    itemId: openedShop.items[i].id, amount: openedShop.items[i].amountInStock
                });
            }
        }
        for(let i = 0; i < openedShop.items.length; i++) {
            player.packetSender.sendUpdateSingleWidgetItem(widgetIds.shop.shopInventory, i, {
                itemId: openedShop.items[i].id, amount: openedShop.items[i].amountInStock
            });
        }

        player.packetSender.sendUpdateAllWidgetItems(widgetIds.shop.playerInventory, player.inventory);

        player.activeWidget = {
            widgetId: widgetIds.shop.shopScreen,
            secondaryWidgetId: widgetIds.shop.playerTab,
            type: 'SCREEN_AND_TAB',
            closeOnWalk: closeOnWalk
        };
    } catch (error) {
        logger.error(`Error opening shop ${identification}: ` + error);
    }

}