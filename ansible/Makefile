all: ipfs ipfs-cluster box

ipfs:
	ansible-playbook -i rpi-inventory.yml -i aws-inventory.yml ipfs.yml
ipfs-cluster:
	ansible-playbook -i rpi-inventory.yml -i aws-inventory.yml ipfs-cluster.yml
box:
	ansible-playbook -i rpi-inventory.yml -i aws-inventory.yml box.yml


rpi: rpi-ipfs rpi-ipfs-cluster rpi-box

rpi-ipfs:
	ansible-playbook -i rpi-inventory.yml ipfs.yml
rpi-ipfs-cluster:
	ansible-playbook -i rpi-inventory.yml ipfs-cluster.yml
rpi-box:
	ansible-playbook -i rpi-inventory.yml box.yml

aws: aws-ipfs aws-ipfs-cluster aws-box

aws-ipfs:
	ansible-playbook -i aws-inventory.yml ipfs.yml
aws-ipfs-cluster:
	ansible-playbook -i aws-inventory.yml ipfs-cluster.yml
aws-box:
	ansible-playbook -i aws-inventory.yml box.yml

aws-dev:
	ansible-playbook -i aws-inventory.yml dev.yml


.PHONY = all ipfs ipfs-cluster box aws aws-ipfs aws-ipfs-cluster aws-box
