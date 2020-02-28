import { Player } from '@server/world/actor/player/player';
import { walkToAction } from '@server/world/actor/player/action/action';
import { basicNumberFilter, basicStringFilter } from '@server/plugins/plugin-loader';
import { logger } from '@runejs/logger/dist/logger';
import { ActionPlugin } from '@server/plugins/plugin';
import { WorldItem } from '@server/world/items/world-item';

/**
 * The definition for a world item action function.
 */
export type worldItemAction = (details: WorldItemActionDetails) => void;

/**
 * Details about a world item being interacted with.
 */
export interface WorldItemActionDetails {
    player: Player;
    worldItem: WorldItem;
}

/**
 * Defines an world item interaction plugin.
 */
export interface WorldItemActionPlugin extends ActionPlugin {
    itemIds?: number | number[];
    options: string | string[];
    walkTo: boolean;
    action: worldItemAction;
}

/**
 * A directory of all world item interaction plugins.
 */
let worldItemInteractions: WorldItemActionPlugin[] = [
];

/**
 * Sets the list of world item interaction plugins.
 * @param plugins The plugin list.
 */
export const setWorldItemPlugins = (plugins: ActionPlugin[]): void => {
    worldItemInteractions = plugins as WorldItemActionPlugin[];
};

// @TODO priority and cancelling other (lower priority) actions
export const worldItemAction = (player: Player, worldItem: WorldItem, option: string): void => {
    // Find all world item action plugins that reference this world item
    const interactionPlugins = worldItemInteractions.filter(plugin => {
        if(plugin.itemIds !== undefined) {
            if(!basicNumberFilter(plugin.itemIds, worldItem.itemId)) {
                return false;
            }
        }

        if(!basicStringFilter(plugin.options, option)) {
            return false;
        }

        return true;
    });

    if(interactionPlugins.length === 0) {
        player.outgoingPackets.chatboxMessage(`Unhandled world item interaction: ${option} ${worldItem.itemId}`);
        return;
    }

    player.actionsCancelled.next();

    // Separate out walk-to actions from immediate actions
    const walkToPlugins = interactionPlugins.filter(plugin => plugin.walkTo);
    const immediatePlugins = interactionPlugins.filter(plugin => !plugin.walkTo);

    // Make sure we walk to the NPC before running any of the walk-to plugins
    if(walkToPlugins.length !== 0) {
        walkToAction(player, worldItem.position)
            .then(() => walkToPlugins.forEach(plugin => plugin.action({ player, worldItem })))
            .catch(() => logger.warn(`Unable to complete walk-to action.`));
    }

    // Immediately run any non-walk-to plugins
    if(immediatePlugins.length !== 0) {
        immediatePlugins.forEach(plugin => plugin.action({ player, worldItem }));
    }
};
