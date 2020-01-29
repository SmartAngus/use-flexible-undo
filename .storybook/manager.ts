import 'storybook-readme/register';
import '@storybook/addon-actions/register';
import '@storybook/addon-links/register';
import { addons } from '@storybook/addons';

addons.setConfig({
  panelPosition: 'right',
  selectedPanel: 'Readme',
});
