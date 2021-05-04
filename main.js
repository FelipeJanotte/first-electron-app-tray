const { resolve, basename } = require('path');
const { app, Menu, Tray, dialog, MenuItem } = require('electron');
const spawn = require('cross-spawn');
const Store = require('electron-store');

const schema = {
  projects: {
    type: 'string',
  },
};

const store = new Store({ schema });

let tray = null;

app.whenReady().then(() => {
  tray = new Tray(resolve(__dirname, 'assets', 'iconTemplate.png'));
  const storedProjects = store.get('projects');
  const projects = storedProjects ? JSON.parse(storedProjects) : [];

  const items = projects.map(project => {
    return {
      label: project.name,
      click: () => spawn.sync('code', [project.path]),
    };
  });

  console.log(projects);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Opções',
      submenu: [
        {
          label: 'Adicionar novo projeto',
          type: 'normal',
          click: () => {
            dialog
              .showOpenDialog({ properties: ['openDirectory'] })
              .then(file => {
                const path = file.filePaths.toString();
                const name = basename(path);
                store.set(
                  'projects',
                  JSON.stringify([
                    ...projects,
                    {
                      path,
                      name,
                    },
                  ])
                );

                const item = new MenuItem({
                  label: name,
                  click: () => {
                    spawn.sync('code', [path]);
                  },
                });

                contextMenu.append(item);
              })
              .catch(err => {
                console.error(err);
              });
          },
        },
        {
          label: 'Fechar programa',
          type: 'normal',
          click: () => {
            app.quit();
          },
        },
        {
          label: 'Limpar lista',
          type: 'normal',
          click: () => {
            store.clear();
            store.reset();
            app.quit();
            app.relaunch();
          }
        }
      ],
    },
    {
      label: 'Lista',
      type: 'separator',
    },
    ...items,
  ]);

  tray.setContextMenu(contextMenu);
});
