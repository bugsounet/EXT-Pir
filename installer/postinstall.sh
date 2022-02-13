#!/bin/bash
# +-----------------+
# | npm postinstall |
# +-----------------+

# get the installer directory
Installer_get_current_dir () {
  SOURCE="${BASH_SOURCE[0]}"
  while [ -h "$SOURCE" ]; do
    DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
    SOURCE="$(readlink "$SOURCE")"
    [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
  done
  echo "$( cd -P "$( dirname "$SOURCE" )" && pwd )"
}

Installer_dir="$(Installer_get_current_dir)"

# move to installler directory
cd "$Installer_dir"
source utils.sh

# Go back to module root
cd ..

# module name
Installer_module="$(grep -Eo '\"name\"[^,]*' ./package.json | grep -Eo '[^:]*$' | awk  -F'\"' '{print $2}')"

echo

Installer_info "Prepare PIR sensor using"
# for pir sensor
sudo usermod -a -G gpio pi || echo "Error command: sudo usermod -a -G gpio pi"
sudo chmod -f u+s /opt/vc/bin/tvservice && sudo chmod -f u+s /bin/chvt || echo "Error command: sudo chmod u+s /opt/vc/bin/tvservice && sudo chmod u+s /bin/chvt"
Installer_success "Done"
echo

Installer_info "Rebuilding MagicMirror..."
MagicMirror-rebuild
echo

# the end...
Installer_warning "Support is now moved in a dedicated Server: https://forum.bugsounet.fr"
Installer_warning "@bugsounet"
echo
Installer_success "$Installer_module is now installed !"
